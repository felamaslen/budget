import {
    fork,
    takeEvery
} from 'redux-saga/effects';

import config from '~api/config';
import logger from '~api/modules/logger';

import { getQuotes, refreshQuotes } from '~api/modules/sockets/saga/quotes-api';
import {
    onStockReceived,
    onCurrencyReceived,
    onClientConnected
} from '~api/modules/sockets/saga/send-receive';

import {
    CLIENT_CONNECTED,
    STOCK_RECEIVED,
    CURRENCY_RECEIVED
} from '~api/modules/sockets/actions';

export default function makeSaga(io) {
    if (!config.data.funds.alphaVantageApiKey) {
        return function *nullSaga() {
            logger.warn('Not initialising sockets');

            yield 0;
        };
    }

    return function *socketSaga() {
        yield takeEvery(CLIENT_CONNECTED, onClientConnected);

        yield takeEvery(STOCK_RECEIVED, onStockReceived(io));
        yield takeEvery(CURRENCY_RECEIVED, onCurrencyReceived(io));

        yield fork(getQuotes);
        yield fork(refreshQuotes);
    };
}
