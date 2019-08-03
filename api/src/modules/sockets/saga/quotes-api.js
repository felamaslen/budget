import {
    select,
    delay,
    throttle,
    fork,
    all,
    call,
    put
} from 'redux-saga/effects';

import logger from '~api/modules/logger';
import {
    getStocksToRefresh,
    getCurrenciesToRefresh
} from '~api/modules/sockets/selectors';

import stockData from '../../../../../stock.json';
import currencyData from '../../../../../currency.json';

import {
    QUOTES_REQUESTED,
    QUOTES_REFRESHED,
    QUOTE_API_REQUESTED,
    STOCK_RECEIVED,
    CURRENCY_RECEIVED
} from '~api/modules/sockets/actions';

const staggerDelay = 500;

function *requestApi(query) {
    try {
        if (query.function === 'GLOBAL_QUOTE') {
            return {
                data: {
                    'Global Quote': {
                        '01. symbol': 'SMT.L',
                        '02. open': '556.5000',
                        '03. high': '558.7400',
                        '04. low': '542.5500',
                        '05. price': '543.0000',
                        '06. volume': '3083615',
                        '07. latest trading day': '2019-08-02',
                        '08. previous close': '568.5000',
                        '09. change': '-25.5000',
                        '10. change percent': '-4.4855%'
                    }
                }
            };
        }
        if (query.function === 'TIME_SERIES_INTRADAY') {
            return { data: stockData };
        }
        if (query.function === 'FX_INTRADAY') {
            return { data: currencyData };
        }

        return null;

        // const res = yield call(axios.get, {
        //     url: 'https://www.alphavantage.co/query',
        //     query: {
        //         ...query,
        //         interval: '1min',
        //         apikey: config.funds.alphaVantageApiKey
        //     }
        // });
        //
        // return res;
    } catch (err) {
        logger.error('[AlphaVantage] API error:', err.stack);

        return null;
    }
}

function *refreshStock(code) {
    logger.debug('[io] API request (stock quote) %s', code);

    const [quote, timeseries] = yield all([
        call(requestApi, {
            function: 'GLOBAL_QUOTE',
            symbol: code
        }),
        call(requestApi, {
            function: 'TIME_SERIES_INTRADAY',
            symbol: code
        })
    ]);

    yield put({
        type: STOCK_RECEIVED,
        code,
        quote,
        timeseries
    });
}

function *refreshCurrency(code) {
    logger.debug('[io] API request (currency quote) %s', code);

    const [from, to] = code.split('/');

    const res = yield call(requestApi, {
        function: 'FX_INTRADAY',
        'from_symbol': from,
        'to_symbol': to
    });

    yield put({
        type: CURRENCY_RECEIVED,
        code,
        res
    });
}

function *refreshQuoteList(key, getItems, onRequest) {
    const items = yield select(getItems);
    if (key === 'stocks') {
        logger.debug('refreshQuoteList', items);
    }
    if (!items.length) {
        return;
    }

    const [code] = items;

    yield put({
        type: QUOTE_API_REQUESTED,
        key,
        code
    });

    yield fork(onRequest, code);

    yield delay(staggerDelay);
    yield call(refreshQuoteList, key, getItems, onRequest);
}

function *refreshQuotesData() {
    yield fork(refreshQuoteList, 'stocks', getStocksToRefresh, refreshStock);
    yield fork(refreshQuoteList, 'currencies', getCurrenciesToRefresh, refreshCurrency);
}

export function *getQuotes() {
    yield throttle(1000, [
        QUOTES_REQUESTED,
        QUOTES_REFRESHED
    ], refreshQuotesData);
}

export function *refreshQuotes() {
    while (true) {
        yield delay(60000);
        yield put({ type: QUOTES_REFRESHED });
    }
}
