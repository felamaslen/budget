/**
 * Actions called on the stocks list
 */

import buildMessage from '../messageBuilder';

import {
    STOCKS_LIST_REQUESTED,
    STOCKS_LIST_RECEIVED,
    STOCKS_PRICES_REQUESTED,
    STOCKS_PRICES_RECEIVED
} from '../constants/actions';

import {
    EF_STOCKS_LIST_REQUESTED, EF_STOCKS_PRICES_REQUESTED
} from '../constants/effects';

export const aStocksListRequested = () => buildMessage(
    STOCKS_LIST_REQUESTED, null, EF_STOCKS_LIST_REQUESTED
);
export const aStocksListReceived = response => buildMessage(STOCKS_LIST_RECEIVED, response);
export const aStocksPricesRequested = () => buildMessage(
    STOCKS_PRICES_REQUESTED, null, EF_STOCKS_PRICES_REQUESTED
);
export const aStocksPricesReceived = response => buildMessage(STOCKS_PRICES_RECEIVED, response);

