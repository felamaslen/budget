import { Map as map, List as list } from 'immutable';
import { createSelector } from 'reselect';
import classNames from 'classnames';
import { formatAge } from '~client/modules/format';
import { getNow } from '~client/selectors/app';
import { transactionsKey, getFundsRows, getCurrentFundsCache } from './helpers';
import { getRowGains, getGainsForRow } from './gains';

export function getFundsCachedValueAgeText(startTime, cacheTimes, now) {
    const age = (now.ts / 1000) - cacheTimes.last() - startTime;

    if (isNaN(age)) {
        return 'no values';
    }
    if (age < 0) {
        return 'in the future!';
    }

    return formatAge(age);
}

const getFundCacheAge = createSelector([getCurrentFundsCache, getNow], (cache, now) => {
    if (!cache) {
        return null;
    }

    const startTime = cache.get('startTime');
    const cacheTimes = cache.get('cacheTimes');

    return getFundsCachedValueAgeText(startTime, cacheTimes, now);
});

const getLastFundsValue = createSelector([getFundsRows, getCurrentFundsCache], (rows, cache) => {
    if (!rows) {
        return 0;
    }

    return rows.reduce((sum, row, id) => {
        const values = cache.getIn(['prices', id, 'values']);
        if (!(values && values.size)) {
            return sum;
        }

        return sum + values.last() * row.getIn(['cols', transactionsKey]).getTotalUnits();
    }, 0);
});

export const getFundsCachedValue = createSelector([getLastFundsValue, getFundCacheAge],
    (value, ageText) => map({ ageText, value }));

export const getFundsCost = createSelector([getFundsRows], rows => {
    if (!rows) {
        return 0;
    }

    return rows.reduce((sum, row) => {
        const transactions = row.getIn(['cols', transactionsKey]);

        if (transactions.isSold()) {
            return sum;
        }

        return sum + transactions.getTotalCost();
    }, 0);
});

function getPricesForRow(prices, id, startTime, cacheTimes) {
    if (!prices.get(id)) {
        return null;
    }

    const pricesStartIndex = prices.getIn([id, 'startIndex']);

    return prices.getIn([id, 'values']).map((price, index) =>
        list([startTime + cacheTimes.get(index + pricesStartIndex), price]));
}

export const getProcessedFundsRows = createSelector([getFundsRows, getCurrentFundsCache], (rows, cache) => {
    if (!(rows && cache)) {
        return null;
    }

    const startTime = cache.get('startTime');
    const cacheTimes = cache.get('cacheTimes');
    const prices = cache.get('prices');

    const rowGains = getRowGains(rows, cache);
    const gains = rowGains.map(item => item.get('gain'));

    const min = gains.min();
    const max = gains.max();

    return rows.map((row, id) => {
        const sold = row.getIn(['cols', transactionsKey]).isSold();

        return row.set('gain', getGainsForRow(rowGains, id, min, max))
            .set('prices', getPricesForRow(prices, id, startTime, cacheTimes))
            .set('sold', sold)
            .set('className', classNames({ sold }));
    });
});

