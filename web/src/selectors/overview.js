import { DateTime } from 'luxon';
import { createSelector } from 'reselect';
import { compose } from 'redux';

import { AVERAGE_MEDIAN } from '~client/constants';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { GRAPH_SPEND_CATEGORIES } from '~client/constants/graph';
import { FUTURE_INVESTMENT_RATE } from '~client/constants/stocks';
import { arrayAverage, randnBm, replaceAtIndex } from '~client/modules/data';
import { getOverviewScoreColor, getOverviewCategoryColor } from '~client/modules/color';
import { getNow } from '~client/selectors/now';

const futureCategories = ['funds', 'food', 'general', 'holiday', 'social'];
const spendingCategories = GRAPH_SPEND_CATEGORIES.map(({ name }) => name);

export const getStartDate = state => state.overview.startDate;
export const getEndDate = state => state.overview.endDate;

const getRows = state => state.overview.rows;
const getCost = state => state.overview.cost;

export const getNumRows = createSelector(getRows, rows => rows && rows.length);

export const getBalance = createSelector(getRows, rows => rows && rows.map(([first]) => first));

const getEndOfDayTimestamp = createSelector(getNow, now => now.endOf('day').ts);

export const getCurrentDate = createSelector(getEndOfDayTimestamp, ts => DateTime.fromMillis(ts));

export const getFutureMonths = createSelector(getCurrentDate, getEndDate, (currentDate, endDate) => {
    if (!(currentDate && endDate)) {
        return 0;
    }

    return Math.floor(endDate.diff(currentDate, 'months').toObject().months);
});

export const getRowDates = createSelector([
    getStartDate,
    getEndDate,
    getNumRows
], (startDate, endDate, numRows) => startDate && new Array(numRows).fill(0)
    .map((item, index) => startDate.plus({ months: index }).endOf('month'))
);

function separateOldFunds(numRows) {
    return cost => {
        if (cost.funds.length > numRows) {
            return {
                ...cost,
                funds: cost.funds.slice(-numRows),
                fundsOld: cost.funds.slice(0, -numRows)
            };
        }

        return { ...cost, fundsOld: [] };
    };
}

const predictCompoundInterest = (annualRate, jitter = 0) => last =>
    last.concat([Math.round(last[last.length - 1] * (1 + annualRate / 12 + randnBm() * jitter))]);

function predictByPastAverages(cost, futureMonths, currentMonthRatio, currentIndex) {
    const currentItems = replaceAtIndex(
        cost.slice(0, -futureMonths),
        currentIndex,
        Math.round(cost[currentIndex] * currentMonthRatio)
    );

    const average = Math.round(arrayAverage(currentItems, AVERAGE_MEDIAN));

    return currentItems.concat(new Array(futureMonths).fill(average));
}

function predictCategory(cost, category, futureMonths, currentMonthRatio, index) {
    if (!futureCategories.includes(category)) {
        return cost;
    }
    if (category === 'funds') {
        return cost.slice(index + 1)
            .reduce(predictCompoundInterest(FUTURE_INVESTMENT_RATE, 0.01), cost.slice(0, index + 1));
    }

    return predictByPastAverages(cost, futureMonths, currentMonthRatio, index);
}

function calculateFutures(numRows, currentDate, futureMonths) {
    if (futureMonths <= 0) {
        return cost => cost;
    }

    const currentMonthRatio = currentDate.daysInMonth / currentDate.day;

    return cost => Object.keys(cost).reduce((last, category) => ({
        ...last,
        [category]: predictCategory(
            cost[category],
            category,
            futureMonths,
            currentMonthRatio,
            cost.income.length - 1 - futureMonths
        )
    }), {});
}

const getSpendingColumn = dates => cost => ({
    ...cost,
    spending: dates.map((date, index) =>
        spendingCategories.reduce((sum, category) => sum + cost[category][index], 0)
    )
});

const getNetCashFlow = dates => cost => ({
    ...cost,
    net: dates.map((date, index) => cost.income[index] - cost.spending[index])
});

const getPredictedBalance = (dates, currentDate, balance) => cost => ({
    ...cost,
    predicted: dates.reduce((values, date, index) => {
        if (index === 0) {
            return values.concat([balance[index]]);
        }

        const fundsNotBoughtOrSold = cost.fundChanges[index];
        const fundChange = fundsNotBoughtOrSold * (cost.funds[index] - cost.funds[index - 1]);

        const netChange = cost.net[index] + fundChange;

        const pastOrPresent = dates[index - 1] < currentDate || dates[index - 1].hasSame(currentDate, 'month');
        if (pastOrPresent) {
            return values.concat([balance[index - 1] + netChange]);
        }

        return values.concat([values[values.length - 1] + netChange]);
    }, [])
});

const getCombinedBalance = (futureMonths, balance) => cost => ({
    ...cost,
    balanceWithPredicted: balance.slice(0, -futureMonths).concat(cost.predicted.slice(-futureMonths))
});

export const getProcessedCost = createSelector([
    getCurrentDate,
    getStartDate,
    getEndDate,
    getNumRows,
    getFutureMonths,
    getRowDates,
    getCost,
    getBalance
], (currentDate, startDate, endDate, numRows, futureMonths, dates, costMap, balance) => {
    if (!costMap) {
        return null;
    }

    return compose(
        getCombinedBalance(futureMonths, balance),
        getPredictedBalance(dates, currentDate, balance),
        getNetCashFlow(dates),
        getSpendingColumn(dates),
        calculateFutures(numRows, currentDate, futureMonths),
        separateOldFunds(numRows)
    )(costMap);
});

export const getOverviewTable = createSelector([
    getCurrentDate, getRowDates, getProcessedCost, getBalance
], (currentDate, dates, cost, balance) => {
    if (!dates) {
        return null;
    }

    const months = dates.map(date => date.toFormat('LLL-yy'));

    const values = OVERVIEW_COLUMNS.slice(1)
        .reduce((last, [key]) => ({ [key]: cost[key], ...last }), { balance });

    const ranges = Object.keys(values).reduce((last, key) => ({
        ...last,
        [key]: { min: Math.min(...values[key]), max: Math.max(...values[key]) }
    }), {});

    const median = Object.keys(values).reduce((last, key) => ({
        ...last,
        [key]: {
            positive: arrayAverage(values[key].filter(item => item >= 0), AVERAGE_MEDIAN),
            negative: arrayAverage(values[key].filter(item => item < 0), AVERAGE_MEDIAN)
        }
    }), {});

    const categoryColor = getOverviewCategoryColor();

    const getColor = (value, key) => getOverviewScoreColor(value, ranges[key], median[key], categoryColor[key]);

    const getCells = (monthText, index) => OVERVIEW_COLUMNS.map(([key, display]) => {
        const column = [key, display];

        if (key === 'month') {
            return {
                column,
                value: monthText,
                rgb: null,
                editable: false
            };
        }
        if (key === 'balance') {
            const value = balance[index];

            return {
                column,
                value,
                rgb: getColor(value, key),
                editable: true
            };
        }

        const value = cost[key][index];

        return {
            column,
            value,
            rgb: getColor(value, key),
            editable: false
        };
    });

    const endOfCurrentMonth = currentDate.endOf('month');

    return months.map((monthText, index) => {
        const date = dates[index];
        const past = date < currentDate;
        const future = date > endOfCurrentMonth;
        const active = !past && !future;

        const cells = getCells(monthText, index);

        return { cells, past, active, future };
    });
});
