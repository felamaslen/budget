import { List as list, Map as map } from 'immutable';
import { createSelector } from 'reselect';

const getTargetsData = state => state.getIn(['pages', 'overview', 'data']);

export const getTargets = createSelector([getTargetsData], data => {
    const periods = list([
        { last: 3, months: 12, tag: '1y' },
        { last: 6, months: 36, tag: '3y' },
        { last: 12, months: 60, tag: '5y' }
    ]);

    const futureMonths = data.get('futureMonths');

    const values = data.getIn(['cost', 'balance'])
        .slice(0, -futureMonths)
        .reverse();

    const currentValue = values.first();

    return periods.map(({ last, months, tag }) => {
        const from = data.getIn(['cost', 'balance', -(futureMonths + 1 + last)]);

        const date = data.getIn(['dates', -(futureMonths + 1 + last)]).ts / 1000;

        const value = from + (currentValue - from) * (months + last) / last;

        return map({ date, from, months, last, tag, value });
    });
});

