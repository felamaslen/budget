import { createSelector } from 'reselect';

const getStocks = state => state.other.stocksList.stocks;
const getIndices = state => state.other.stocksList.indices;

export const getStocksListInfo = createSelector([getStocks, getIndices], (stocks, indices) => ({
    stocks, indices
}));
