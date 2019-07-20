import { createSelector } from 'reselect';
import compose from 'just-compose';

import { AVERAGE_MEDIAN } from '~client/constants';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { FUTURE_INVESTMENT_RATE } from '~client/constants/stocks';
import { IDENTITY, arrayAverage, randnBm, replaceAtIndex } from '~client/modules/data';
import { getOverviewScoreColor, getOverviewCategoryColor } from '~client/modules/color';
import { getCurrentDate } from '~client/selectors/now';
import {
    getCost,
    getSpendingColumn,
    getStartDate,
    getEndDate,
    getNumMonths,
    getFutureMonths,
    getMonthDates
} from '~client/selectors/overview/common';
import { getNetWorthSummary } from '~client/selectors/overview/net-worth';

const futureCategories = ['funds', 'food', 'general', 'holiday', 'social'];

function separateOldFunds(numRows) {
    return data => {
        if (data.funds.length > numRows) {
            return {
                ...data,
                funds: data.funds.slice(-numRows),
                fundsOld: data.funds.slice(0, -numRows)
            };
        }

        return { ...data, fundsOld: [] };
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
        return IDENTITY;
    }

    const currentMonthRatio = currentDate.daysInMonth / currentDate.day;

    return cost => Object.keys(cost).reduce((last, category) => ({
        ...last,
        [category]: predictCategory(
            cost[category],
            category,
            futureMonths,
            currentMonthRatio,
            numRows - 1 - futureMonths
        )
    }), {});
}

const getNetCashFlow = dates => data => ({
    ...data,
    net: dates.map((date, index) => data.income[index] - data.spending[index])
});

const getPredictedNetWorth = (dates, currentDate, netWorth) => data => ({
    ...data,
    netWorthPredicted: dates.reduce((values, date, index) => {
        if (index === 0) {
            return values.concat([netWorth[index]]);
        }

        const pastOrPresent = dates[index - 1] < currentDate ||
            dates[index - 1].hasSame(currentDate, 'month');

        const fundsBoughtOrSold = data.fundChanges[index] === 1;

        const fundChange = fundsBoughtOrSold && pastOrPresent
            ? (data.funds[index] - data.funds[index - 1])
            : 0;

        const netChange = data.net[index] + fundChange;

        if (pastOrPresent) {
            return values.concat([netWorth[index - 1] + netChange]);
        }

        return values.concat([values[values.length - 1] + netChange]);
    }, [])
});

const getCombinedNetWorth = (futureMonths, netWorth) => table => ({
    ...table,
    netWorthCombined: netWorth.slice(0, -(futureMonths + 1))
        .concat(table.netWorthPredicted.slice(-(futureMonths + 1)))
});

export const getProcessedCost = createSelector([
    getCurrentDate,
    getStartDate,
    getEndDate,
    getNumMonths,
    getFutureMonths,
    getMonthDates,
    getNetWorthSummary,
    getCost
], (
    currentDate,
    startDate,
    endDate,
    numRows,
    futureMonths,
    dates,
    netWorth,
    costMap
) => compose(
    separateOldFunds(numRows),
    calculateFutures(numRows, currentDate, futureMonths),
    getSpendingColumn(dates),
    getNetCashFlow(dates),
    data => ({ ...data, netWorth }),
    getPredictedNetWorth(dates, currentDate, netWorth),
    getCombinedNetWorth(futureMonths, netWorth)
)(costMap));

export const getOverviewTable = createSelector([
    getCurrentDate,
    getMonthDates,
    getProcessedCost,
    getNetWorthSummary
], (currentDate, dates, cost, netWorth) => {
    if (!dates) {
        return null;
    }

    const months = dates.map(date => date.toFormat('LLL-yy'));

    const values = OVERVIEW_COLUMNS.slice(1)
        .reduce((last, [key]) => ({ [key]: cost[key], ...last }), { netWorth });

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
                rgb: null
            };
        }
        if (key === 'netWorth') {
            const value = netWorth[index];

            return {
                column,
                value,
                rgb: getColor(value, key)
            };
        }

        const value = cost[key][index];

        return {
            column,
            value,
            rgb: getColor(value, key)
        };
    });

    const endOfCurrentMonth = currentDate.endOf('month');

    return months.map((monthText, index) => {
        const date = dates[index];
        const past = date < currentDate;
        const future = date > endOfCurrentMonth;
        const active = !past && !future;

        const cells = getCells(monthText, index);

        return { key: monthText, cells, past, active, future };
    });
});
