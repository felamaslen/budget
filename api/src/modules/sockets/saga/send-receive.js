import { eventChannel } from 'redux-saga';
import {
    select,
    take,
    call,
    put
} from 'redux-saga/effects';

import logger from '~api/modules/logger';
import {
    getFreshStocks,
    getFreshCurrencies,
    getStocks,
    getCurrencies
} from '~api/modules/sockets/selectors';

import {
    CLIENT_DISCONNECTED,
    QUOTES_REQUESTED
} from '~api/modules/sockets/actions';

function makeClientListener(socket, stocks, currencies) {
    return eventChannel(emit => {
        socket.on('request-quotes', symbols => {
            if (!Array.isArray(symbols) && symbols.every(value => typeof value === 'string')) {
                logger.warn('[io] Invalid request-quotes data: %s', JSON.stringify(symbols));

                return;
            }

            const wantCurrencies = symbols.filter(value => (/^[A-Z]{3}\/[A-Z]{3}$/).test(value));
            const wantStocks = symbols.filter(value => !currencies.includes(value) && value.length);

            wantStocks.forEach(code => socket.join(`stock-${code}`));
            wantCurrencies.forEach(code => socket.join(`currency-${code}`));

            emit({
                type: QUOTES_REQUESTED,
                socketId: socket.id,
                stocks: wantStocks,
                currencies: wantCurrencies
            });

            const have = [
                ...stocks.filter(({ code }) => wantStocks.includes(code)),
                ...currencies.filter(({ code }) => wantCurrencies.includes(code))
            ];

            socket.emit('receive-quotes', have.map(({ code, data }) => ({ code, data })));
        });

        socket.on('disconnect', () => {
            logger.debug('[io] socket disconnected', socket.id);

            emit({
                type: CLIENT_DISCONNECTED,
                socketId: socket.id
            });
        });

        return () => {
            socket.disconnect();
        };
    });
}

export function *onClientConnected({ socket }) {
    logger.debug('[io] socket connected', socket.id);

    const stocks = yield select(getFreshStocks);
    const currencies = yield select(getFreshCurrencies);

    const channel = yield call(makeClientListener, socket, stocks, currencies);

    while (true) {
        const action = yield take(channel);

        yield put(action);
    }
}

function *sendDataToClient(io, key, items, code) {
    const item = items.find(({ code: compare }) => compare === code);
    if (!item) {
        return;
    }

    const { data } = item;

    const room = yield call([io, 'in'], `${key}-${code}`);
    yield call([room, 'emit'], 'receive-quote', {
        code,
        data
    });
}

export function onStockReceived(io) {
    return function *handleStockResponse({ code }) {
        const stocks = yield select(getStocks);

        yield call(sendDataToClient, io, 'stock', stocks, code);
    };
}

export function onCurrencyReceived(io) {
    return function *handleCurrencyResponse({ code }) {
        const currencies = yield select(getCurrencies);

        yield call(sendDataToClient, io, 'currency', currencies, code);
    };
}
