import { createSelector } from 'reselect';
import { getBalance, getFutureMonths, getRowDates } from './overview';

const targetPeriods = [
    { last: 3, months: 12, tag: '1y' },
    { last: 6, months: 36, tag: '3y' },
    { last: 12, months: 60, tag: '5y' }
];

export const getTargets = createSelector([
    getBalance,
    getFutureMonths,
    getRowDates
], (balance, futureMonths, dates) => {
    const values = balance.slice(0, -futureMonths).reverse();

    return targetPeriods.map(({ last, months, tag }) => {
        const index = ((-(futureMonths + 1 + last) % balance.length) + balance.length) % balance.length;

        const from = balance[index];

        const date = dates[index].ts / 1000;

        const value = from + (values[0] - from) * (months + last) / last;

        return { date, from, months, last, tag, value };
    });
});
