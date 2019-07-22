import * as actions from '~client/constants/actions/stocks';

export const stocksListRequested = () => ({ type: actions.STOCKS_LIST_REQUESTED });
export const stocksListReceived = (res, err = null) => ({ type: actions.STOCKS_LIST_RECEIVED, res, err });
export const stockPricesRequested = () => ({ type: actions.STOCKS_PRICES_REQUESTED });
export const stockPricesReceived = (res, err = null) => ({ type: actions.STOCKS_PRICES_RECEIVED, res, err });
