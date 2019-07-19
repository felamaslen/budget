import { createSelector } from 'reselect';

import { getNetWorthSummary } from '~client/selectors/net-worth';
import { getFutureMonths, getMonthDates } from '~client/selectors/common';

const targetPeriods = [
    { last: 3, months: 12, tag: '1y' },
    { last: 6, months: 36, tag: '3y' },
    { last: 12, months: 60, tag: '5y' }
];

export const getTargets = createSelector([
    getNetWorthSummary,
    getFutureMonths,
    getMonthDates
], (netWorth, futureMonths, dates) => {
    const values = netWorth.slice(0, -futureMonths).reverse();

    return targetPeriods.map(({ last, months, tag }) => {
        const index = ((-(futureMonths + 1 + last) % netWorth.length) + netWorth.length) % netWorth.length;

        const from = netWorth[index];

        const date = dates[index].ts / 1000;

        const value = from + (values[0] - from) * (months + last) / last;

        return { date, from, months, last, tag, value };
    });
});
