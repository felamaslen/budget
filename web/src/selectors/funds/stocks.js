import { createSelector } from 'reselect';

const getStocks = state => state.getIn(['other', 'stocksList', 'stocks']);
const getIndices = state => state.getIn(['other', 'stocksList', 'indices']);

export const getStocksListInfo = createSelector([getStocks, getIndices], (stocks, indices) => ({
    stocks, indices
}));


