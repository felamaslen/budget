import { createSelector } from 'reselect';
import { PAGES } from '~client/constants/data';

export const transactionsKey = PAGES.funds.cols.indexOf('transactions');
export const itemKey = PAGES.funds.cols.indexOf('item');

export const getViewSoldFunds = state => Boolean(state.other.viewSoldFunds);

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

export const getFundsRows = state => state.pages.funds.rows;

export const getFundsCache = state => state.pages.funds.cache;
const getFundsPeriod = state => state.other.graphFunds.period;

export const getCurrentFundsCache = createSelector([
    getFundsPeriod,
    getFundsCache
], (period, cache) => cache && cache[period]);
