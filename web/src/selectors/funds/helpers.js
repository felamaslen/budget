import { createSelector } from 'reselect';

export const getViewSoldFunds = state => Boolean(state.funds.viewSoldFunds);

export const getFundsRows = state => state.funds.items;

export const getFundsCache = state => state.funds.cache;
const getFundsPeriod = state => state.funds.period;

export const getCurrentFundsCache = createSelector([
    getFundsPeriod,
    getFundsCache
], (period, cache) => cache && cache[period]);
