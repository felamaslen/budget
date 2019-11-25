import { createSelector } from 'reselect';
import compose from 'just-compose';

import { sortByKey } from '~client/modules/data';
import { DELETE } from '~client/constants/data';

export const getViewSoldFunds = (state) => Boolean(state.funds.viewSoldFunds);

const getNonFilteredFundsRows = (state) => state.funds.items;

export const getFundsRows = createSelector(getNonFilteredFundsRows, compose(
    (items) => items.filter(({ __optimistic }) => __optimistic !== DELETE),
    sortByKey('item'),
));

export const getFundsCache = (state) => state.funds.cache;
const getFundsPeriod = (state) => state.funds.period;

export const getCurrentFundsCache = createSelector([
    getFundsPeriod,
    getFundsCache,
], (period, cache) => cache && cache[period]);
