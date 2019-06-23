import { createSelector } from 'reselect';
import { PAGES } from '~client/constants/data';

export const transactionsKey = PAGES.funds.cols.indexOf('transactions');
export const itemKey = PAGES.funds.cols.indexOf('item');

export const getViewSoldFunds = state => Boolean(state.getIn(['other', 'viewSoldFunds']));

export function getRowLengths(prices) {
    const timeOffsets = prices.map(row => row.get('startIndex'));
    const rowLengths = prices.map((row, id) => row.get('values').size + timeOffsets.get(id));

    const maxLength = rowLengths.max();

    return { timeOffsets, rowLengths, maxLength };
}

export const getFundsRows = state => state.getIn(['pages', 'funds', 'rows']);

export const getFundsCache = state => state.getIn(['pages', 'funds', 'cache']);
const getFundsPeriod = state => state.getIn(['other', 'graphFunds', 'period']);

export const getCurrentFundsCache = createSelector([getFundsPeriod, getFundsCache],
    (period, cache) => cache && cache.get(period));
