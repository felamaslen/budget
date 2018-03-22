/**
 * Process overview data
 */

import { List as list, Map as map, fromJS } from 'immutable';
import { DateTime } from 'luxon';
import { AVERAGE_MEDIAN, AVERAGE_EXP } from '../constants';
import { OVERVIEW_COLUMNS } from '../constants/data';
import { FUTURE_INVESTMENT_RATE } from '../constants/stocks';
import { GRAPH_SPEND_CATEGORIES } from '../constants/graph';
import { getNow } from '../helpers/date';
import { listAverage, randnBm } from '../helpers/data';
import { getOverviewCategoryColor, getOverviewScoreColor } from '../helpers/color';

function calculateFutures(cost, futureCategories, futureMonths) {
    if (futureMonths <= 0) {
        return cost;
    }

    const now = getNow();
    const currentMonthRatio = now.daysInMonth / now.day;
    const currentKey = cost.get('balance').size - futureMonths - 1;

    return cost.map((categoryCost, category) => {
        if (!futureCategories.includes(category)) {
            return categoryCost;
        }

        if (category === 'funds') {
            // randomly generate fund income projections
            if (futureMonths <= 0) {
                return categoryCost;
            }

            return categoryCost.slice(0, currentKey)
                .concat(new Array(futureMonths).fill(0)
                    .reduce(
                        result => result.push(result.last() * (1 + FUTURE_INVESTMENT_RATE / 12 + randnBm() / 100)),
                        categoryCost.slice(currentKey, currentKey + 1)
                    )
                    .map(Math.round)
                );
        }

        // find the average value and make predictions based on that
        const currentMonthExtrapolated = Math.round(categoryCost.get(currentKey) * currentMonthRatio);
        const currentItems = categoryCost.slice(0, currentKey)
            .push(currentMonthExtrapolated);

        const average = Math.round(listAverage(currentItems, AVERAGE_EXP));

        return currentItems.concat(list(new Array(futureMonths).fill(average)));
    });
}

export function rProcessDataOverview({ costMap, startDate, currentDate, endDate, futureMonths }) {
    const { months: monthDiff } = endDate.diff(startDate, 'months').toObject();
    const numRows = Math.round(monthDiff) + 1;
    const numCols = 1;

    const dates = list(new Array(numRows).fill(0))
        .map((item, key) => startDate.plus({ months: key })
            .endOf('month')
        );

    // separate funds into old and displayed
    let costActual = costMap;
    if (!(costActual.has('fundsOld') && costActual.get('fundsOld').size)) {
        const funds = costActual.get('funds');
        costActual = costActual
            .set('funds', funds.slice(-numRows))
            .set('fundsOld', funds.slice(0, funds.size - numRows));
    }

    const futureCategories = list.of('funds', 'food', 'general', 'holiday', 'social');
    const costWithFutures = calculateFutures(costActual, futureCategories, futureMonths);

    // add spending column
    const spendingCategories = GRAPH_SPEND_CATEGORIES.map(({ name }) => name);
    const spending = dates.map((date, key) => spendingCategories.reduce((sum, category) =>
        sum + costWithFutures.getIn([category, key]), 0));

    // add net cash flow column
    const net = dates.map((date, key) =>
        costWithFutures.getIn(['income', key]) - spending.get(key));

    // add predicted balance
    const predicted = dates.reduce((values, date, key) => {
        if (key === 0) {
            return values.push(costWithFutures.getIn(['balance', 0]));
        }

        if (dates.get(key - 1) < currentDate || dates.get(key - 1).hasSame(currentDate, 'month')) {
            return values.push(costWithFutures.getIn(['balance', key - 1]) + net.get(key));
        }

        return values.push(values.last() + net.get(key));

    }, list.of());

    const balanceWithPredicted = costWithFutures.get('balance').slice(0, -futureMonths)
        .concat(predicted.slice(-futureMonths));

    const cost = costWithFutures
        .set('spending', spending)
        .set('net', net)
        .set('predicted', predicted)
        .set('balanceWithPredicted', balanceWithPredicted);

    return map({
        numRows,
        numCols,
        futureMonths,
        startDate,
        endDate,
        currentDate,
        dates,
        cost,
        costActual
    });
}

function rProcessDataOverviewRaw(reduction, raw) {
    const {
        currentYear,
        currentMonth,
        startYearMonth: [startYear, startMonth],
        endYearMonth: [endYear, endMonth],
        cost,
        futureMonths,
        targets
    } = raw;

    const startDate = DateTime.fromObject({ year: startYear, month: startMonth }).endOf('month');
    const currentDate = DateTime.fromObject({ year: currentYear, month: currentMonth }).endOf('month');
    const endDate = DateTime.fromObject({ year: endYear, month: endMonth }).endOf('month');

    const costMap = fromJS(cost);

    return rProcessDataOverview({ costMap, startDate, currentDate, endDate, futureMonths })
        .set('targets', fromJS(targets));
}

export function rGetOverviewRows(data) {
    const currentDate = data.get('currentDate');
    const dates = data.get('dates');
    const months = dates.map(date => date.toFormat('LLL-yy'));
    const values = OVERVIEW_COLUMNS.slice(1)
        .map(([key]) => data.getIn(['cost', key]));

    const ranges = values.map(col => ({ min: col.min(), max: col.max() }));
    const median = values.map(col => ({
        positive: listAverage(col.filter(item => item >= 0), AVERAGE_MEDIAN),
        negative: listAverage(col.filter(item => item < 0), AVERAGE_MEDIAN)
    }));

    const categoryColor = getOverviewCategoryColor();

    return months.map((monthText, rowKey) => {
        const date = dates.get(rowKey);
        const past = date < currentDate;
        const active = date <= currentDate && date >= currentDate;
        const future = !past && !active;

        const cells = list(OVERVIEW_COLUMNS.map(([key, display], colKey) => {
            if (colKey === 0) {
                return map({
                    column: list([key, display]),
                    value: monthText,
                    rgb: null,
                    editable: false
                });
            }

            const value = data.getIn(['cost', key, rowKey]);

            const rgb = getOverviewScoreColor(
                value, ranges[colKey - 1], median[colKey - 1], categoryColor[colKey - 1]);

            return map({
                column: list([key, display]),
                value,
                rgb,
                editable: key === 'balance'
            });
        }));

        const cols = list([data.getIn(['cost', 'balance', rowKey])]);

        return map({ cols, cells, past, active, future });
    });
}

function getUpdatedCostMap(oldCost, dates, req) {
    const { page, newDate, oldDate, newItemCost, oldItemCost } = req;

    const getKeyFromDate = date => dates.findIndex(item => date.hasSame(item, 'month'));

    const newKey = getKeyFromDate(newDate);
    const oldKey = getKeyFromDate(oldDate);

    const setCost = (key, diff) => costMap => {
        if (key > -1) {
            return costMap.setIn([page, key], costMap.getIn([page, key]) + diff);
        }

        return costMap;
    };

    const setOld = setCost(oldKey, -oldItemCost);
    const setNew = setCost(newKey, +newItemCost);

    return setOld(setNew(oldCost));
}

export function rCalculateOverview(reduction, req) {
    const costMap = reduction.getIn(['pages', 'overview', 'data', 'costActual']);
    const dates = reduction.getIn(['pages', 'overview', 'data', 'dates']);
    const startDate = reduction.getIn(['pages', 'overview', 'data', 'startDate']);
    const endDate = reduction.getIn(['pages', 'overview', 'data', 'endDate']);
    const currentDate = reduction.getIn(['pages', 'overview', 'data', 'currentDate']);
    const futureMonths = reduction.getIn(['pages', 'overview', 'data', 'futureMonths']);

    const newCostMap = getUpdatedCostMap(costMap, dates, req);

    // update the changed rows in the overview page
    const newData = rProcessDataOverview({ costMap: newCostMap, startDate, currentDate, endDate, futureMonths });

    return reduction
        .setIn(['pages', 'overview', 'data'], newData.set('targets',
            reduction.getIn(['pages', 'overview', 'data', 'targets'])))
        .setIn(['pages', 'overview', 'rows'], rGetOverviewRows(newData));
}

/**
 * Called when data is first loaded
 * @param {Record} reduction: app state
 * @param {string} page: page index
 * @param {object} raw: api JSON data
 * @returns {Record} modified reduction
 */
export function processPageDataOverview(reduction, { raw }) {
    const data = rProcessDataOverviewRaw(reduction, raw);
    const rows = rGetOverviewRows(data);

    return reduction.setIn(['pages', 'overview'], map({ data, rows }));
}

