import { createSelector } from 'reselect';
import classNames from 'classnames';
import humanizeDuration from 'humanize-duration';

import { isSold, getTotalUnits, getTotalCost } from '~client/modules/data';
import { getNow } from '~client/selectors/now';
import { getFundsRows, getCurrentFundsCache } from '~client/selectors/funds/helpers';
import { getRowGains, getGainsForRow } from '~client/selectors/funds/gains';

export const getPeriod = (state) => state.funds.period;

export function getFundsCachedValueAgeText(startTime, cacheTimes, now) {
    const age = now.ts - 1000 * (cacheTimes[cacheTimes.length - 1] + startTime);

    if (Number.isNaN(age)) {
        return 'no values';
    }
    if (age < 0) {
        return 'in the future!';
    }

    return `${humanizeDuration(age, { round: true, largest: 1 })} ago`;
}

const getFundCacheAge = createSelector(getNow, getCurrentFundsCache, (now, cache) => {
    if (!cache) {
        return '';
    }

    const { startTime, cacheTimes } = cache;

    return getFundsCachedValueAgeText(startTime, cacheTimes, now);
});

const getLastFundsValue = createSelector([getFundsRows, getCurrentFundsCache], (rows, cache) => {
    if (!(rows && cache)) {
        return 0;
    }

    return rows.reduce((sum, { id, transactions }) => {
        const { values: prices } = cache.prices[id] || {};
        if (!(prices && prices.length)) {
            return sum;
        }

        return sum + prices[prices.length - 1] * getTotalUnits(transactions);
    }, 0);
});

export const getFundsCachedValue = createSelector([
    getLastFundsValue,
    getFundCacheAge,
], (value, ageText) => ({ value, ageText }));

export const getFundsCost = createSelector(getFundsRows, (rows) => {
    if (!rows) {
        return 0;
    }

    return rows.reduce((sum, { transactions }) => {
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
        price,
    ]));
}

export const getProcessedFundsRows = createSelector([getFundsRows, getCurrentFundsCache], (rows, cache) => {
    if (!(rows && cache)) {
        return null;
    }

    const { startTime, cacheTimes, prices } = cache;

    const rowGains = getRowGains(rows, cache);

    return rows.map((row) => {
        const sold = isSold(row.transactions);

        return {
            ...row,
            gain: getGainsForRow(rowGains, row.id),
            prices: getPricesForRow(prices, row.id, startTime, cacheTimes),
            sold,
            className: classNames({ sold }),
        };
    });
});
