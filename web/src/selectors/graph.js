import { createSelector } from 'reselect';

import { getProcessedCost } from '~client/selectors/overview';
import { getFutureMonths, getMonthDates } from '~client/selectors/overview/common';

const targetPeriods = [
    { last: 3, months: 12, tag: '1y' },
    { last: 6, months: 36, tag: '3y' },
    { last: 12, months: 60, tag: '5y' },
];

export const getTargets = createSelector([
    getProcessedCost,
    getFutureMonths,
    getMonthDates,
], ({ netWorthCombined, netWorth }, futureMonths, dates) => {
    const values = [
        netWorthCombined[netWorthCombined.length - 1 - futureMonths],
        ...netWorth.slice(0, -(futureMonths + 1)).reverse(),
    ];

    return targetPeriods.map(({ last, months, tag }) => {
        const index = ((-(futureMonths + last) % netWorth.length) + netWorth.length) % netWorth.length;

        const from = netWorth[index];

        const date = dates[index].ts / 1000;

        const value = from + (values[0] - from) * ((months + last) / (last - 1));

        return {
            date, from, months, last, tag, value,
        };
    });
});
