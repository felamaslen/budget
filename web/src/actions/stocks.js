import * as actions from '~client/constants/actions/stocks';

export const stocksListCleared = () => ({ type: actions.STOCKS_LIST_CLEARED });
export const stocksListRequested = () => ({ type: actions.STOCKS_LIST_REQUESTED });
export const stocksListReceived = (res, err = null) => ({ type: actions.STOCKS_LIST_RECEIVED, res, err });

export const stockQuotesReceived = items => ({ type: actions.STOCK_QUOTES_RECEIVED, items });
