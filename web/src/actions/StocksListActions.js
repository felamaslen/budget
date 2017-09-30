/**
 * Actions called on the stocks list
 */

// TODO

import buildMessage from '../messageBuilder';

import {
    STOCKS_LIST_REQUESTED,
    STOCKS_LIST_RECEIVED,
    STOCKS_PRICES_REQUESTED,
    STOCKS_PRICES_RECEIVED
} from '../constants/actions';

export const aStocksListRequested = () => buildMessage(STOCKS_LIST_REQUESTED);
export const aStocksListReceived = response => buildMessage(STOCKS_LIST_RECEIVED, response);
export const aStocksPricesRequested = () => buildMessage(STOCKS_PRICES_REQUESTED);
export const aStocksPricesReceived = response => buildMessage(STOCKS_PRICES_RECEIVED, response);

