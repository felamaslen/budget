import { createSelector } from 'reselect';

import { DELETE } from '~client/constants/data';

export const getViewSoldFunds = state => Boolean(state.funds.viewSoldFunds);

const getNonFilteredFundsRows = state => state.funds.items;

export const getFundsRows = createSelector(getNonFilteredFundsRows,
    items => items.filter(({ __optimistic }) => __optimistic !== DELETE));

export const getFundsCache = state => state.funds.cache;
const getFundsPeriod = state => state.funds.period;

export const getCurrentFundsCache = createSelector([
    getFundsPeriod,
    getFundsCache
], (period, cache) => cache && cache[period]);
