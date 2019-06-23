/**
 * Actions called on the stocks list
 */

import * as A from '~client/constants/actions';

export const aStocksListRequested = () => ({ type: A.STOCKS_LIST_REQUESTED });
export const aStocksListReceived = res => ({ type: A.STOCKS_LIST_RECEIVED, ...res });
export const aStocksPricesRequested = () => ({ type: A.STOCKS_PRICES_REQUESTED });
export const aStocksPricesReceived = res => ({ type: A.STOCKS_PRICES_RECEIVED, ...res });
