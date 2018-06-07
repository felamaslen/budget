export const getFundHistoryCache = state => state.getIn(['other', 'fundHistoryCache']);

export const getStocksListInfo = state => ({
    stocks: state.getIn(['other', 'stocksList', 'stocks']),
    indices: state.getIn(['other', 'stocksList', 'indices'])
});

