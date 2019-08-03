import { eventChannel } from 'redux-saga';
import { select, race, delay, fork, takeLatest, take, call, put } from 'redux-saga/effects';
import axios from 'axios';
import querystring from 'querystring';

import { errorOpened } from '~client/actions/error';
import { fundsReceived } from '~client/actions/funds';
import { stocksListReceived, stockQuotesReceived } from '~client/actions/stocks';
import { getApiKey } from '~client/selectors/api';
import { getFundsCache } from '~client/selectors/funds/helpers';
import { getPeriod } from '~client/selectors/funds';
import { getStocks, getIndices } from '~client/selectors/stocks';
import { getPeriodMatch } from '~client/modules/data';
import { API_PREFIX } from '~client/constants/data';
import { FUNDS_REQUESTED } from '~client/constants/actions/funds';
import { STOCKS_LIST_REQUESTED, STOCKS_LIST_RECEIVED } from '~client/constants/actions/stocks';
import { DO_STOCKS_LIST, STOCK_PRICES_DELAY } from '~client/constants/stocks';

export function *getFundHistoryQuery(period = null) {
    const nextPeriod = period || (yield select(getPeriod));

    const periodMatch = getPeriodMatch(nextPeriod);

    return { ...periodMatch, history: true };
}

export function *requestFundPeriodData({ period, fromCache }) {
    const nextPeriod = period || (yield select(getPeriod));
    if (fromCache) {
        const cache = yield select(getFundsCache);

        if (cache[nextPeriod]) {
            yield put(fundsReceived(nextPeriod));

            return;
        }
    }

    const query = yield call(getFundHistoryQuery, nextPeriod);
    const apiKey = yield select(getApiKey);

    try {
        const res = yield call(axios.get, `${API_PREFIX}/data/funds?${querystring.stringify(query)}`, {
            headers: {
                Authorization: apiKey
            }
        });

        yield put(fundsReceived(nextPeriod, res.data));
    } catch (err) {
        yield put(errorOpened('Error loading fund data'));
    }
}

export function *requestStocksList() {
    if (!DO_STOCKS_LIST) {
        return;
    }

    const apiKey = yield select(getApiKey);

    try {
        const res = yield call(axios.get, `${API_PREFIX}/data/stocks`, {
            headers: {
                Authorization: apiKey
            }
        });

        yield put(stocksListReceived(res.data));
    } catch (err) {
        yield put(stocksListReceived(null));
    }
}

function makeQuoteReceiverChannel(io) {
    return eventChannel(emit => {
        io.on('receive-quote', ({ code, data }) => emit(stockQuotesReceived([{ code, data }])));
        io.on('receive-quotes', items => emit(stockQuotesReceived(items)));

        return () => null;
    });
}

export function *watchQuotesReceived(io) {
    const channel = yield call(makeQuoteReceiverChannel, io);

    while (true) {
        const action = yield take(channel);

        yield put(action);
    }
}

export function *requestQuotes(io) {
    const stocks = yield select(getStocks);
    const indices = yield select(getIndices);

    const symbols = Array.from(new Set(stocks.concat(indices).map(({ code }) => code)));

    if (!symbols.length) {
        return;
    }

    yield call([io, 'emit'], 'request-quotes', symbols);
}

export function *requestQuotesLoop(io) {
    while (true) {
        yield call(requestQuotes, io);

        yield race([
            delay(STOCK_PRICES_DELAY),
            take(STOCKS_LIST_RECEIVED)
        ]);
    }
}

export default function *fundsSaga(io) {
    yield takeLatest(FUNDS_REQUESTED, requestFundPeriodData);
    yield takeLatest(STOCKS_LIST_REQUESTED, requestStocksList);

    yield fork(watchQuotesReceived, io);
    yield fork(requestQuotesLoop, io);
}
