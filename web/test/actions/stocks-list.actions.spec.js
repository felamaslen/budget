import test from 'ava';

import {
    aStocksListRequested,
    aStocksListReceived,
    aStocksPricesRequested,
    aStocksPricesReceived
} from '~client/actions/stocks-list.actions';

import {
    STOCKS_LIST_REQUESTED,
    STOCKS_LIST_RECEIVED,
    STOCKS_PRICES_REQUESTED,
    STOCKS_PRICES_RECEIVED
} from '~client/constants/actions';

test('aStocksListRequested returns STOCKS_LIST_REQUESTED', t => {
    t.deepEqual(aStocksListRequested(), { type: STOCKS_LIST_REQUESTED });
});

test('aStocksListReceived returns STOCKS_LIST_RECEIVED with response object', t => {
    t.deepEqual(aStocksListReceived({ foo: 'bar' }), {
        type: STOCKS_LIST_RECEIVED, foo: 'bar'
    });
});

test('aStocksPricesRequested returns STOCKS_PRICES_REQUESTED', t => {
    t.deepEqual(aStocksPricesRequested(), { type: STOCKS_PRICES_REQUESTED });
});

test('aStocksPricesReceived returns STOCKS_PRICES_RECEIVED with response object', t => {
    t.deepEqual(aStocksPricesReceived({ foo: 'bar' }), {
        type: STOCKS_PRICES_RECEIVED, foo: 'bar'
    });
});

