import { createSelector } from 'reselect';
import compose from 'just-compose';

import { AVERAGE_MEDIAN } from '~client/constants';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { FUTURE_INVESTMENT_RATE } from '~client/constants/stocks';
import {
    IDENTITY, arrayAverage, randnBm, replaceAtIndex,
} from '~client/modules/data';
import { getOverviewScoreColor, getOverviewCategoryColor } from '~client/modules/color';
import { getCurrentDate } from '~client/selectors/now';
import {
    getCost,
    getSpendingColumn,
    getStartDate,
    getEndDate,
    getNumMonths,
    getFutureMonths,
    getMonthDates,
} from '~client/selectors/overview/common';
import { getNetWorthSummary } from '~client/selectors/overview/net-worth';
import { getFundsRows } from '~client/selectors/funds/helpers';

const futureCategories = ['funds', 'food', 'general', 'holiday', 'social'];

function separateOldFunds(numRows) {
    return (data) => {
        if (data.funds.length > numRows) {
            return {
                ...data,
                funds: data.funds.slice(-numRows),
                fundsOld: data.funds.slice(0, -numRows),
            };
        }

        return { ...data, fundsOld: [] };
    };
}

const predictCompoundInterest = (annualRate, jitter = 0) => (last) => (
    last.concat([Math.round(last[last.length - 1] * (1 + annualRate / 12 + randnBm() * jitter))])
);

function predictByPastAverages(cost, futureMonths, currentMonthRatio, currentIndex) {
    const currentItems = replaceAtIndex(
        cost.slice(0, -futureMonths),
        currentIndex,
        Math.round(cost[currentIndex] * currentMonthRatio),
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

    return (cost) => Object.keys(cost).reduce((last, category) => ({
        ...last,
        [category]: predictCategory(
            cost[category],
            category,
            futureMonths,
            currentMonthRatio,
            numRows - 1 - futureMonths,
        ),
    }), {});
}

const getNetCashFlow = (dates) => (data) => ({
    ...data,
    net: dates.map((date, index) => data.income[index] - data.spending[index]),
});

const getPredictedNetWorth = (dates, currentDate, netWorth, fundsRows) => (data) => {
    const fundCosts = dates.map((monthDate) => fundsRows.reduce((sum, { transactions }) => transactions
        .filter(({ date }) => date.hasSame(monthDate, 'month'))
        .reduce((last, { cost }) => last + cost, sum), 0));

    const endOfCurrentMonth = currentDate.endOf('month');
    const futureStart = endOfCurrentMonth.hasSame(currentDate, 'day')
        ? endOfCurrentMonth.plus({ months: 1 })
        : endOfCurrentMonth;

    return {
        ...data,
        netWorthPredicted: dates.reduce((values, date, index) => {
            if (index === 0) {
                return values.concat([netWorth[index]]);
            }

            const future = dates[index] > futureStart;

            const netChange = data.net[index]
                + data.funds[index] - data.funds[index - 1]
                - fundCosts[index];

            if (future) {
                return values.concat([values[values.length - 1] + netChange]);
            }

            return values.concat([netWorth[index - 1] + netChange]);
        }, []),
    };
};

const getCombinedNetWorth = (currentDate, futureMonths, netWorth) => (table) => {
    const includeThisMonth = currentDate.endOf('month').hasSame(currentDate, 'day')
        ? 0
        : 1;

    const slice = -(futureMonths + includeThisMonth);

    return {
        ...table,
        netWorthCombined: [
            ...netWorth.slice(0, slice),
            ...table.netWorthPredicted.slice(slice),
        ],
    };
};

export const getProcessedCost = createSelector([
    getCurrentDate,
    getStartDate,
    getEndDate,
    getNumMonths,
    getFutureMonths,
    getMonthDates,
    getNetWorthSummary,
    getFundsRows,
    getCost,
], (
    currentDate,
    startDate,
    endDate,
    numRows,
    futureMonths,
    dates,
    netWorth,
    fundsRows,
    costMap,
) => compose(
    separateOldFunds(numRows),
    calculateFutures(numRows, currentDate, futureMonths),
    getSpendingColumn(dates),
    getNetCashFlow(dates),
    (data) => ({ ...data, netWorth }),
    getPredictedNetWorth(dates, currentDate, netWorth, fundsRows),
    getCombinedNetWorth(currentDate, futureMonths, netWorth),
)(costMap));

const isPositive = (value) => value >= 0;
const isNegative = (value) => value < 0;

export const getOverviewTable = createSelector([
    getCurrentDate,
    getMonthDates,
    getFutureMonths,
    getProcessedCost,
    getNetWorthSummary,
], (currentDate, dates, futureMonths, cost, netWorth) => {
    if (!dates) {
        return null;
    }

    const months = dates.map((date) => date.toFormat('LLL-yy'));

    const values = OVERVIEW_COLUMNS.slice(1)
        .reduce((last, [key]) => ({ [key]: cost[key], ...last }), { netWorth });

    const scoreValues = {
        ...values,
        netWorth: values.netWorth.slice(0, -(futureMonths + 1)),
    };

    const ranges = Object.keys(values).reduce((last, key) => ({
        [key]: {
            min: Math.min(...scoreValues[key]),
            maxNegative: key === 'net'
                ? 0
                : Math.max(...scoreValues[key].filter(isNegative)),
            minPositive: key === 'net'
                ? 0
                : Math.min(...scoreValues[key].filter(isPositive)),
            max: Math.max(...scoreValues[key]),
        },
        ...last,
    }), {});

    const median = Object.keys(values).reduce((last, key) => ({
        ...last,
        [key]: {
            positive: arrayAverage(scoreValues[key].filter(isPositive), AVERAGE_MEDIAN),
            negative: arrayAverage(scoreValues[key].filter(isNegative), AVERAGE_MEDIAN),
        },
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
            };
        }

        const value = cost[key][index];

        return {
            column,
            value,
            rgb: getColor(value, key),
        };
    });

    const endOfCurrentMonth = currentDate.endOf('month');

    return months.map((monthText, index) => {
        const date = dates[index];
        const past = date < currentDate;
        const future = date > endOfCurrentMonth;
        const active = !past && !future;

        const cells = getCells(monthText, index);

        return {
            key: monthText, cells, past, active, future,
        };
    });
});
