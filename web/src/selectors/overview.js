import { List as list, Map as map } from 'immutable';
import { DateTime } from 'luxon';
import { createSelector } from 'reselect';
import { compose } from 'redux';
import { AVERAGE_MEDIAN } from '../constants';
import { OVERVIEW_COLUMNS } from '../constants/data';
import { GRAPH_SPEND_CATEGORIES } from '../constants/graph';
import { FUTURE_INVESTMENT_RATE } from '../constants/stocks';
import { listAverage, randnBm } from '../helpers/data';
import { getOverviewScoreColor, getOverviewCategoryColor } from '../helpers/color';
import { getNow } from './app';

const futureCategories = list.of('funds', 'food', 'general', 'holiday', 'social');
const spendingCategories = GRAPH_SPEND_CATEGORIES.map(({ name }) => name);

export const getStartDate = state => state.getIn(['pages', 'overview', 'startDate']);
export const getEndDate = state => state.getIn(['pages', 'overview', 'endDate']);

const getRows = state => state.getIn(['pages', 'overview', 'rows']);
const getCost = state => state.getIn(['pages', 'overview', 'cost']);

export const getNumRows = createSelector([getRows], rows => rows && rows.size);

export const getBalance = createSelector([getRows], rows => rows && rows.map(item => item.get(0)));

const getCurrentDateTimestamp = createSelector([getNow], now => now.endOf('day').ts);

export const getCurrentDate = createSelector([getCurrentDateTimestamp], ts => DateTime.fromMillis(ts));

export const getFutureMonths = createSelector([getCurrentDate, getEndDate], (currentDate, endDate) =>
    currentDate && endDate && Math.floor(endDate.diff(currentDate, 'months').toObject().months || 0));

export const getRowDates = createSelector([
    getFutureMonths, getStartDate, getEndDate, getNumRows
], (futureMonths, startDate, endDate, numRows) => startDate &&
    list(new Array(numRows).fill(0)).map((item, key) => startDate.plus({ months: key }).endOf('month'))
);

function separateOldFunds(numRows) {
    return cost => {
        const funds = cost.get('funds');

        if (funds.size > numRows) {
            return cost.set('funds', funds.slice(-numRows))
                .set('fundsOld', funds.slice(0, -numRows));
        }

        return cost.set('fundsOld', list.of());
    };
}

function predictCompoundInterest(annualRate, jitter = 0) {
    const monthlyRate = annualRate / 12;

    return red => red.push(Math.round(red.last() * (1 + monthlyRate / 12 + randnBm() * jitter)));
}

function predictByPastAverages(cost, futureMonths, currentMonthRatio, currentIndex) {
    const currentItems = cost.slice(0, -futureMonths)
        .set(currentIndex, Math.round(cost.get(currentIndex) * currentMonthRatio));

    const average = Math.round(listAverage(currentItems, AVERAGE_MEDIAN));

    return currentItems.concat(list(new Array(futureMonths).fill(average)));
}

function predictCategory(futureMonths, currentMonthRatio, currentIndex) {
    return (cost, category) => {
        if (!futureCategories.includes(category)) {
            return cost;
        }
        if (category === 'funds') {
            return cost.slice(currentIndex + 1)
                .reduce(predictCompoundInterest(FUTURE_INVESTMENT_RATE, 0.01),
                    cost.slice(0, currentIndex + 1)
                );
        }

        return predictByPastAverages(cost, futureMonths, currentMonthRatio, currentIndex);
    };
}

function calculateFutures(numRows, currentDate, futureMonths) {
    if (futureMonths <= 0) {
        return cost => cost;
    }

    const currentMonthRatio = currentDate.daysInMonth / currentDate.day;

    return cost => {
        const currentIndex = cost.get('income').size - 1 - futureMonths;

        return cost.map(predictCategory(futureMonths, currentMonthRatio, currentIndex));
    };
}

function getSpendingColumn(dates) {
    return cost => {
        return cost.set('spending', dates.map((date, key) =>
            spendingCategories.reduce((sum, category) => sum + cost.getIn([category, key]), 0)
        ));
    };
}

function getNetCashFlow(dates) {
    return cost => cost.set('net', dates.map((date, index) =>
        cost.getIn(['income', index]) - cost.getIn(['spending', index])));
}

function getPredictedBalance(dates, currentDate, balance) {
    return cost => cost.set('predicted', dates.reduce((values, date, index) => {
        if (index === 0) {
            return values.push(balance.get(index));
        }

        const fundsNotBoughtOrSold = cost.getIn(['fundChanges', index]);
        const fundChange = fundsNotBoughtOrSold * (cost.getIn(['funds', index]) - cost.getIn(['funds', index - 1]));

        const netChange = cost.getIn(['net', index]) + fundChange;

        const pastOrPresent = dates.get(index - 1) < currentDate ||
            dates.get(index - 1).hasSame(currentDate, 'month');

        if (pastOrPresent) {
            return values.push(balance.get(index - 1) + netChange);
        }

        return values.push(values.last() + netChange);

    }, list.of()));
}

function getCombinedBalance(futureMonths, balance) {
    return cost => {
        return cost.set('balanceWithPredicted', balance
            .slice(0, -futureMonths)
            .concat(cost.get('predicted').slice(-futureMonths)));
    };
}

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

    const values = map(OVERVIEW_COLUMNS.slice(1)
        .map(([key]) => ([key, cost.get(key)]))
    )
        .set('balance', balance);

    const ranges = values.map(col => ({ min: col.min(), max: col.max() }));
    const median = values.map(col => ({
        positive: listAverage(col.filter(item => item >= 0), AVERAGE_MEDIAN),
        negative: listAverage(col.filter(item => item < 0), AVERAGE_MEDIAN)
    }));

    const categoryColor = getOverviewCategoryColor();

    const getColor = (value, key) => {
        return getOverviewScoreColor(value, ranges.get(key), median.get(key), categoryColor.get(key));
    };

    const getCells = (monthText, index) => list(OVERVIEW_COLUMNS.map(([key, display]) => {
        const column = list.of(key, display);

        if (key === 'month') {
            return map({
                column,
                value: monthText,
                rgb: null,
                editable: false
            });
        }
        if (key === 'balance') {
            const value = balance.get(index);

            return map({
                column,
                value,
                rgb: getColor(value, key),
                editable: true
            });
        }

        const value = cost.getIn([key, index]);

        return map({
            column,
            value,
            rgb: getColor(value, key),
            editable: false
        });
    }));

    const endOfCurrentMonth = currentDate.endOf('month');

    return months.map((monthText, index) => {
        const date = dates.get(index);
        const past = date < currentDate;
        const future = date > endOfCurrentMonth;
        const active = !past && !future;

        const cells = getCells(monthText, index);

        return map({ cells, past, active, future });
    });
});

