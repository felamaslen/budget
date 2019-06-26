import { createSelector } from 'reselect';
import classNames from 'classnames';
import { formatAge } from '~client/modules/format';
import { isSold, getTotalUnits, getTotalCost } from '~client/modules/data';
import { getNow } from '~client/selectors/app';
import { transactionsKey, getFundsRows, getCurrentFundsCache } from './helpers';
import { getRowGains, getGainsForRow } from './gains';

export function getFundsCachedValueAgeText(startTime, cacheTimes, now) {
    const age = (now.ts / 1000) - cacheTimes[cacheTimes.length - 1] - startTime;

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

    const { startTime, cacheTimes } = cache;

    return getFundsCachedValueAgeText(startTime, cacheTimes, now);
});

const getLastFundsValue = createSelector([getFundsRows, getCurrentFundsCache], (rows, cache) => {
    if (!rows) {
        return 0;
    }

    return rows.reduce((sum, { id, cols }) => {
        const { values: prices } = cache.prices[id];
        if (!(prices && prices.length)) {
            return sum;
        }

        return sum + prices[prices.length - 1] * getTotalUnits(cols[transactionsKey]);
    }, 0);
});

export const getFundsCachedValue = createSelector([
    getLastFundsValue,
    getFundCacheAge
], (value, ageText) => ({ value, ageText }));

export const getFundsCost = createSelector([getFundsRows], rows => {
    if (!rows) {
        return 0;
    }

    return rows.reduce((sum, row) => {
        const transactions = row.getIn(['cols', transactionsKey]);

        if (isSold(transactions)) {
            return sum;
        }

        return sum + getTotalCost(transactions);
    }, 0);
});

function getPricesForRow(prices, id, startTime, cacheTimes) {
    if (!prices[id]) {
        return null;
    }

    return prices[id].values.map((price, index) => ([
        startTime + cacheTimes[index + prices[id].startIndex],
        price
    ]));
}

export const getProcessedFundsRows = createSelector([getFundsRows, getCurrentFundsCache], (rows, cache) => {
    if (!(rows && cache)) {
        return null;
    }

    const { startTime, cacheTimes, prices } = cache;

    const rowGains = getRowGains(rows, cache);

    return rows.map(row => {
        const sold = isSold(row.cols[transactionsKey]);

        return {
            ...row,
            gain: getGainsForRow(rowGains, row.id),
            prices: getPricesForRow(prices, row.id, startTime, cacheTimes),
            sold,
            className: classNames({ sold })
        };
    });
});
