import { createSelector } from 'reselect';

export const getViewSoldFunds = state => Boolean(state.funds.viewSoldFunds);

export function getRowLengths(prices) {
    const timeOffsets = Object.keys(prices).reduce((last, id) => ({
        ...last,
        [id]: prices[id].startIndex
    }), {});
    const rowLengths = Object.keys(prices).reduce((last, id) => ({
        ...last,
        [id]: prices[id].values.length + timeOffsets[id]
    }), {});

    const maxLength = Object.keys(prices).reduce((last, id) => Math.max(last, rowLengths[id]), 0);

    return { timeOffsets, rowLengths, maxLength };
}

export const getFundsRows = state => state.funds.items;

export const getFundsCache = state => state.funds.cache;
const getFundsPeriod = state => state.funds.period;

export const getCurrentFundsCache = createSelector([
    getFundsPeriod,
    getFundsCache
], (period, cache) => cache && cache[period]);
