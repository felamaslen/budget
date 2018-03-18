/**
 * Process overview data
 */

import { List as list, Map as map, fromJS } from 'immutable';

import { AVERAGE_MEDIAN, AVERAGE_EXP, MONTHS_SHORT } from '../constants';
import { OVERVIEW_COLUMNS } from '../constants/data';
import { FUTURE_INVESTMENT_RATE } from '../constants/stocks';
import { getNow, yearMonthDifference } from '../misc/date';
import { getKeyFromYearMonth, getYearMonthFromKey, listAverage, randnBm } from '../misc/data';
import { getOverviewCategoryColor, getOverviewScoreColor } from '../misc/color';

function calculateFutures(cost, futureCategories, futureMonths, futureKey) {
    if (futureMonths <= 0) {
        return cost;
    }

    const now = getNow();
    const currentMonthRatio = now.daysInMonth / now.day;

    return cost.map((categoryCost, category) => {
        if (!futureCategories.includes(category)) {
            return categoryCost;
        }

        if (category === 'funds') {
            // randomly generate fund income projections
            const oldOffset = categoryCost.size - cost.get('balance').size;

            const currentItems = categoryCost.slice(oldOffset, oldOffset + futureKey);

            const numFutureItems = categoryCost.size - oldOffset - futureKey;
            if (numFutureItems <= 0) {
                return currentItems;
            }

            const latestValue = categoryCost.get(oldOffset + futureKey - 1);

            return categoryCost
                .slice(0, oldOffset + futureKey)
                .concat(new Array(numFutureItems).fill(0)
                    .reduce(
                        result => result.push(result.last() *
                            (1 + FUTURE_INVESTMENT_RATE / 12 + randnBm() / 100)
                        ),
                        list([latestValue])
                    )
                    .shift()
                    .map(value => Math.round(value))
                );
        }

        // find the average value and make predictions based on that
        const currentMonthExtrapolated = Math.round(categoryCost.get(futureKey - 1) * currentMonthRatio);
        const currentItems = categoryCost
            .slice(0, futureKey - 1)
            .push(currentMonthExtrapolated);

        const average = Math.round(listAverage(currentItems, AVERAGE_EXP));

        return currentItems.concat(list(new Array(futureMonths).fill(average)));
    });
}

function calculateTableData(data) {
    const cost = data.get('cost');
    const numRows = data.get('numRows');
    const startYear = data.get('startYearMonth')[0];
    const startMonth = data.get('startYearMonth')[1];

    // add month column
    let months = [];
    if (numRows > 0) {
        months = new Array(numRows)
            .fill(0)
            .map((item, key) => {
                const yearMonth = getYearMonthFromKey(key, startYear, startMonth);

                return `${MONTHS_SHORT[yearMonth[1] - 1]}-${yearMonth[0]}`;
            });
    }

    return list.of()
        .push(list(months))
        .push(cost.get('funds'))
        .push(cost.get('bills'))
        .push(cost.get('food'))
        .push(cost.get('general'))
        .push(cost.get('holiday'))
        .push(cost.get('social'))
        .push(cost.get('income'))
        .push(cost.get('spending'))
        .push(cost.get('net'))
        .push(cost.get('predicted'))
        .push(cost.get('balance'))
        .push(cost.get('balanceWithPredicted'));
}

export function rProcessDataOverview(
    costMap, startYearMonth, endYearMonth, currentYearMonth, futureMonths
) {
    const numRows = yearMonthDifference(startYearMonth, endYearMonth) + 1;
    const numCols = 1;

    const yearMonths = new Array(numRows)
        .fill(0)
        .map((item, key) => getYearMonthFromKey(
            key, startYearMonth[0], startYearMonth[1]
        ));

    const yearMonthsList = list(yearMonths);

    // separate funds into old and displayed
    let costActual = costMap;
    if (!(costActual.has('fundsOld') && costActual.get('fundsOld').size)) {
        const funds = costActual.get('funds');
        costActual = costActual
            .set('funds', funds.slice(-numRows))
            .set('fundsOld', funds.slice(0, funds.size - numRows));
    }

    const futureCategories = list.of('funds', 'food', 'general', 'holiday', 'social');
    const futureKey = yearMonthDifference(startYearMonth, currentYearMonth) + 1;
    const costWithFutures = calculateFutures(costActual, futureCategories, futureMonths, futureKey);

    // add spending column
    const spending = yearMonthsList.map((month, key) =>
        costWithFutures.getIn(['bills', key]) +
        costWithFutures.getIn(['food', key]) +
        costWithFutures.getIn(['general', key]) +
        costWithFutures.getIn(['holiday', key]) +
        costWithFutures.getIn(['social', key])
    );

    // add net cash flow column
    const net = yearMonthsList.map((month, key) =>
        costWithFutures.getIn(['income', key]) - spending.get(key)
    );

    // add predicted balance
    let lastPredicted = costWithFutures.getIn(['balance', 0]);

    const predicted = yearMonthsList.map((month, key) => {
        const havePrevious = key > 0;
        const past = key < futureKey;
        const presentAndHaveLast = key === futureKey && costWithFutures.getIn(['balance', key - 1]) > 0;

        if (havePrevious && (past || presentAndHaveLast)) {
            lastPredicted = costWithFutures.getIn(['balance', key - 1]) + net.get(key);

            return lastPredicted;
        }

        const newPredicted = lastPredicted + net.get(key);
        lastPredicted = newPredicted;

        return newPredicted;
    });

    const balanceWithPredicted = costWithFutures.get('balance').slice(0, futureKey)
        .concat(predicted.slice(-numRows + futureKey));

    const cost = costWithFutures
        .set('spending', spending)
        .set('net', net)
        .set('predicted', predicted)
        .set('balanceWithPredicted', balanceWithPredicted);

    return map({
        numRows,
        numCols,
        futureKey,
        futureMonths,
        startYearMonth,
        endYearMonth,
        currentYearMonth,
        yearMonths,
        cost,
        costActual
    });
}

function rProcessDataOverviewRaw(raw) {
    const currentYearMonth = [raw.currentYear, raw.currentMonth];
    const costMap = fromJS(raw.cost);

    return rProcessDataOverview(costMap, raw.startYearMonth, raw.endYearMonth, currentYearMonth, raw.futureMonths)
        .set('targets', fromJS(raw.targets));
}

export function rGetOverviewRows(data) {
    const currentYear = data.get('currentYearMonth')[0];
    const currentMonth = data.get('currentYearMonth')[1];

    const tableData = calculateTableData(data);

    // get value ranges and medians for calculating colours
    const values = OVERVIEW_COLUMNS.slice(1).map((column, colKey) => tableData.get(colKey + 1));

    const valueRange = values.map(valuesItem => ({
        min: valuesItem.min(),
        max: valuesItem.max()
    }));

    const median = values.map(valuesItem => ({
        positive: listAverage(valuesItem.filter(item => item >= 0), AVERAGE_MEDIAN),
        negative: listAverage(valuesItem.filter(item => item < 0), AVERAGE_MEDIAN)
    }));

    const categoryColor = getOverviewCategoryColor();

    // translate the data into table cells for display in the view
    const rows = tableData
        .get(0)
        .map((monthText, key) => {
            const yearMonth = getYearMonthFromKey(
                key, data.get('startYearMonth')[0], data.get('startYearMonth')[1]);

            const past = yearMonth[0] < currentYear ||
                (yearMonth[0] === currentYear && yearMonth[1] < currentMonth);
            const active = yearMonth[0] === currentYear && yearMonth[1] === currentMonth;
            const future = !past && !active;

            let cols = null;

            const cells = list(OVERVIEW_COLUMNS)
                .map((column, colKey) => {
                    const value = tableData.getIn([colKey, key]);
                    let rgb = null;
                    if (colKey > 0 && categoryColor[colKey - 1]) {
                        rgb = getOverviewScoreColor(
                            value,
                            valueRange[colKey - 1],
                            median[colKey - 1],
                            categoryColor[colKey - 1]
                        );
                    }

                    const editable = column[0] === 'balance';

                    if (editable) {
                        // for use with editables
                        cols = list([value]);
                    }

                    return map({
                        column: list(column),
                        value,
                        rgb,
                        editable
                    });
                });

            return map({ cols, cells, past, active, future });
        });

    return rows;
}

export function rCalculateOverview(reduction, { page, newDate, oldDate, newItemCost, oldItemCost }) {
    const startYearMonth = reduction.getIn(['pages', 'overview', 'data', 'startYearMonth']);

    const newKey = getKeyFromYearMonth(newDate.year, newDate.month, startYearMonth[0], startYearMonth[1]);
    const oldKey = getKeyFromYearMonth(oldDate.year, oldDate.month, startYearMonth[0], startYearMonth[1]);

    const oldCost = reduction.getIn(['pages', 'overview', 'data', 'costActual']);
    const numRows = oldCost.get(page).size;

    // update the changed rows in the overview page
    let newCost = oldCost;
    if (oldKey === newKey) {
        if (oldKey < numRows) {
            newCost = newCost.setIn(
                [page, oldKey],
                oldCost.getIn([page, oldKey]) + newItemCost - oldItemCost
            );
        }
    }
    else {
        if (oldKey < numRows) {
            newCost = newCost.setIn(
                [page, oldKey],
                oldCost.getIn([page, oldKey]) - oldItemCost
            );
        }
        if (newKey < numRows) {
            newCost = newCost.setIn(
                [page, newKey],
                oldCost.getIn([page, newKey]) + newItemCost
            );
        }
    }

    const endYearMonth = reduction.getIn(['pages', 'overview', 'data', 'endYearMonth']);
    const currentYearMonth = reduction.getIn(['pages', 'overview', 'data', 'currentYearMonth']);
    const futureMonths = reduction.getIn(['pages', 'overview', 'data', 'futureMonths']);

    const newData = rProcessDataOverview(
        newCost, startYearMonth, endYearMonth, currentYearMonth, futureMonths
    );

    return reduction
        .setIn(['pages', 'overview', 'data'], newData)
        .setIn(['pages', 'overview', 'data', 'targets'],
            reduction.getIn(['pages', 'overview', 'data', 'targets'])
        )
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
    const data = rProcessDataOverviewRaw(raw);
    const rows = rGetOverviewRows(data);

    return reduction.setIn(['pages', 'overview'], map({ data, rows }));
}

