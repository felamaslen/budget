/**
 * Process overview data
 */

import { PAGES, AVERAGE_MEDIAN, MONTHS_SHORT, OVERVIEW_COLUMNS } from '../../misc/const';
import { FUTURE_INVESTMENT_RATE } from '../../misc/config';
import { yearMonthDifference } from '../../misc/date';
import { getKeyFromYearMonth, getYearMonthFromKey, listAverage, randnBm } from '../../misc/data';
import { getOverviewCategoryColor, getOverviewScoreColor } from '../../misc/color';
import { List as list, Map as map, fromJS } from 'immutable';

/**
 * Calculate futures from past averages / predictions
 * @param {list} cost: processed cost data
 * @param {list} futureCategories: categories to process
 * @param {integer} futureMonths: number of months going into the future
 * @param {integer} futureKey: key to separate between past/present and future
 * @returns {list} first six columns of data for overview table
 */
const calculateFutures = (cost, futureCategories, futureMonths, futureKey) => {
    return futureCategories.map(category => {
        const categoryCost = cost.get(category);

        if (category === 'funds') {
            // randomly generate fund income projections
            const oldOffset = categoryCost.size - cost.get('balance').size;
            let Xt = categoryCost.get(oldOffset + futureKey - 1);
            return categoryCost.slice(oldOffset, oldOffset + futureKey).concat(list(
                Array.apply(null, new Array(categoryCost.size - oldOffset - futureKey)).map(() => {
                    Xt *= (1 + FUTURE_INVESTMENT_RATE / 12 + randnBm() / 100);
                    return Math.round(Xt);
                })
            ));
        }

        // find the average value and make predictions based on that
        const average = Math.round(listAverage(categoryCost, futureMonths, AVERAGE_MEDIAN));
        const newCost = categoryCost.slice(
            0, categoryCost.size - futureMonths
        ).concat(
            list(Array.apply(null, new Array(futureMonths)).map(() => average))
        );
        return newCost;
    });
};

/**
 * Calculate the remaining table data, e.g. net income
 * Called after calculateFutures() which predicts future data
 * @param {map} data: processed data
 * @returns {list} all twelve columns of data for overview table
 */
const calculateTableData = data => {
    const cost = data.get('cost');
    const numRows = data.get('numRows');
    const startYear = data.get('startYearMonth')[0];
    const startMonth = data.get('startYearMonth')[1];

    // add month column
    const months = list(Array.apply(null, new Array(numRows)).map((_, key) => {
        const yearMonth = getYearMonthFromKey(key, startYear, startMonth);
        return `${MONTHS_SHORT[yearMonth[1] - 1]}-${yearMonth[0]}`;
    }));

    return list.of()
        .push(months)
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
        .push(cost.get('balance'));
};

export const rProcessDataOverview = (costMap, startYearMonth, endYearMonth, currentYearMonth, futureMonths) => {
    const numRows = yearMonthDifference(startYearMonth, endYearMonth) + 1;
    const numCols = 1;
    const yearMonths = Array.apply(null, new Array(numRows)).map((_, key) => {
        return getYearMonthFromKey(key, startYearMonth[0], startYearMonth[1]);
    });
    const yearMonthsList = list(yearMonths);

    // separate funds into old and displayed
    let cost = costMap;
    if (!cost.has('fundsOld') || !cost.get('fundsOld').size) {
        const funds = cost.get('funds');
        cost = cost.set('funds', funds.slice(-numRows))
            .set('fundsOld', funds.slice(0, funds.size - numRows));
    }

    const futureCategories = list.of('funds', 'food', 'general', 'holiday', 'social');
    const futureKey = yearMonthDifference(startYearMonth, currentYearMonth) + 1;
    const futureData = calculateFutures(cost, futureCategories, futureMonths, futureKey);
    futureCategories.forEach((category, key) => {
        cost = cost.set(category, futureData.get(key));
    });

    // add spending column
    const spending = yearMonthsList.map((month, key) => {
        return cost.getIn(['bills', key]) +
      cost.getIn(['food', key]) +
      cost.getIn(['general', key]) +
      cost.getIn(['holiday', key]) +
      cost.getIn(['social', key]);
    });

    // add net cash flow column
    const net = yearMonthsList.map((month, key) => {
    // add predicted (random) fund income to the net cash flow
        const fundIncome = key === 0 || key < futureKey ? 0
            : cost.getIn(['funds', key]) - cost.getIn(['funds', key - 1]);
        return cost.getIn(['income', key]) - spending.get(key) + fundIncome;
    });

    // add predicted balance
    let lastPredicted = cost.getIn(['balance', 0]);
    const predicted = yearMonthsList.map((month, key) => {
        if (key > 0 && (key < futureKey ||
                    (key === futureKey) && cost.getIn(['balance', key - 1]) > 0)) {
            lastPredicted = cost.getIn(['balance', key - 1]) + net.get(key);
            return lastPredicted;
        }
        const newPredicted = lastPredicted + net.get(key);
        lastPredicted = newPredicted;
        return newPredicted;
    });

    const balanceWithPredicted = cost.get('balance').slice(0, futureKey)
        .concat(predicted.slice(-numRows + futureKey));

    cost = cost
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
        cost
    });
};

/**
 * Process data for insertion into the store
 * @param {object} raw: api JSON data response
 * @returns {Map} immutable data
 */
const rProcessDataOverviewRaw = raw => {
    const currentYearMonth = [raw.currentYear, raw.currentMonth];
    const costMap = fromJS(raw.cost);

    return rProcessDataOverview(
        costMap, raw.startYearMonth, raw.endYearMonth, currentYearMonth, raw.futureMonths);
};

/**
 * Get rows for display in the view
 * @param {List} data: processed data
 * @returns {List} rows for the view
 */
export const rGetOverviewRows = data => {
    const currentYear = data.get('currentYearMonth')[0];
    const currentMonth = data.get('currentYearMonth')[1];

    const tableData = calculateTableData(data);

    // get value ranges and medians for calculating colours
    const values = OVERVIEW_COLUMNS.slice(1).map((column, colKey) => tableData.get(colKey + 1));
    const valueRange = values.map(valuesItem => [valuesItem.min(), valuesItem.max()]);
    const median = values.map(valuesItem => {
        return [
            listAverage(valuesItem.filter(item => item >= 0), 0, AVERAGE_MEDIAN), // median of positive values
            listAverage(valuesItem.filter(item => item < 0), 0, AVERAGE_MEDIAN) // median of negative values
        ];
    });

    const categoryColor = getOverviewCategoryColor();

    // translate the data into table cells for display in the view
    const rows = tableData.get(0).map((monthText, key) => {
        const yearMonth = getYearMonthFromKey(
            key, data.get('startYearMonth')[0], data.get('startYearMonth')[1]);

        const past = yearMonth[0] < currentYear ||
      (yearMonth[0] === currentYear && yearMonth[1] < currentMonth);
        const active = yearMonth[0] === currentYear && yearMonth[1] === currentMonth;
        const future = !past && !active;

        const cells = list(OVERVIEW_COLUMNS).map((column, colKey) => {
            const value = tableData.getIn([colKey, key]);
            let rgb = null;
            if (colKey > 0 && categoryColor[colKey - 1]) {
                rgb = getOverviewScoreColor(
                    value, valueRange[colKey - 1], median[colKey - 1], categoryColor[colKey - 1]);
            }
            const editable = column[0] === 'balance';

            return map({
                column,
                value,
                rgb,
                editable
            });
        });

        return map({ cells, past, active, future });
    });

    return rows;
};

/**
 * @function rCalculateOverview
 * @param {Record} reduction: modified reduction
 * @param {integer} pageIndex: page which is modified
 * @param {YMD} newDate: modified item date
 * @param {YMD} oldDate: original item date
 * @param {integer} newItemCost: modified item cost
 * @param {integer} oldItemCost: original item cost
 * @returns {Record} reduction with re-calculated overview data
 */
export const rCalculateOverview = (reduction, pageIndex, newDate, oldDate, newItemCost, oldItemCost) => {
    const overviewKey = PAGES.indexOf('overview');
    const startYearMonth = reduction.getIn(['appState', 'pages', overviewKey, 'data', 'startYearMonth']);

    const newKey = getKeyFromYearMonth(newDate.year, newDate.month, startYearMonth[0], startYearMonth[1]);
    const oldKey = getKeyFromYearMonth(oldDate.year, oldDate.month, startYearMonth[0], startYearMonth[1]);

    const oldCost = reduction.getIn(['appState', 'pages', overviewKey, 'data', 'cost']);
    const numRows = oldCost.get(PAGES[pageIndex]).size;

    // update the changed rows in the overview page
    let newCost = oldCost;
    if (oldKey === newKey) {
        if (oldKey < numRows) {
            newCost = newCost.setIn(
                [PAGES[pageIndex], oldKey],
                oldCost.getIn([PAGES[pageIndex], oldKey]) + newItemCost - oldItemCost
            );
        }
    }
    else {
        if (oldKey < numRows) {
            newCost = newCost.setIn(
                [PAGES[pageIndex], oldKey],
                oldCost.getIn([PAGES[pageIndex], oldKey]) - oldItemCost
            );
        }
        if (newKey < numRows) {
            newCost = newCost.setIn(
                [PAGES[pageIndex], newKey],
                oldCost.getIn([PAGES[pageIndex], newKey]) + newItemCost
            );
        }
    }

    const endYearMonth = reduction.getIn(['appState', 'pages', overviewKey, 'data', 'endYearMonth']);
    const currentYearMonth = reduction.getIn(['appState', 'pages', overviewKey, 'data', 'currentYearMonth']);
    const futureMonths = reduction.getIn(['appState', 'pages', overviewKey, 'data', 'futureMonths']);

    const newData = rProcessDataOverview(
        newCost, startYearMonth, endYearMonth, currentYearMonth, futureMonths);

    return reduction.setIn(['appState', 'pages', overviewKey, 'data'], newData)
        .setIn(['appState', 'pages', overviewKey, 'rows'], rGetOverviewRows(newData));
};

/**
 * Called when data is first loaded
 * @param {Record} reduction: app state
 * @param {integer} pageIndex: page index
 * @param {object} raw: api JSON data
 * @returns {Record} modified reduction
 */
export default (reduction, pageIndex, raw) => {
    const data = rProcessDataOverviewRaw(raw);
    const rows = rGetOverviewRows(data);

    return reduction.setIn(['appState', 'pages', pageIndex], map({ data, rows }));
};

