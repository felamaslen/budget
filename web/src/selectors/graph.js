import { List as list, Map as map } from 'immutable';
import { createSelector } from 'reselect';
import { getBalance, getFutureMonths, getRowDates } from './overview';

export const getTargets = createSelector([
    getBalance, getFutureMonths, getRowDates
], (balance, futureMonths, dates) => {
    const periods = list([
        { last: 3, months: 12, tag: '1y' },
        { last: 6, months: 36, tag: '3y' },
        { last: 12, months: 60, tag: '5y' }
    ]);

    const values = balance.slice(0, -futureMonths)
        .reverse();

    const currentValue = values.first();

    return periods.map(({ last, months, tag }) => {
        const from = balance.get(-(futureMonths + 1 + last));

        const date = dates.get(-(futureMonths + 1 + last)).ts / 1000;

        const value = from + (currentValue - from) * (months + last) / last;

        return map({ date, from, months, last, tag, value });
    });
});

