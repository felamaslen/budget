/**
 * Actions called on the stocks list
 */

import buildMessage from '../messageBuilder';

import {
  AC_STOCKS_LIST_REQUESTED,
  AC_STOCKS_LIST_RECEIVED,
  AC_STOCKS_PRICES_REQUESTED,
  AC_STOCKS_PRICES_RECEIVED
} from '../constants/actions';

export const aStocksListRequested = () => buildMessage(AC_STOCKS_LIST_REQUESTED);
export const aStocksListReceived = response => buildMessage(AC_STOCKS_LIST_RECEIVED, response);
export const aStocksPricesRequested = () => buildMessage(AC_STOCKS_PRICES_REQUESTED);
export const aStocksPricesReceived = response => buildMessage(AC_STOCKS_PRICES_RECEIVED, response);

