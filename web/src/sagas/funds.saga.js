import { List as list } from 'immutable';
import { all, select, takeEvery, call, put } from 'redux-saga/effects';
import axios from 'axios';
import querystring from 'querystring';

import { GRAPH_FUNDS_PERIOD_CHANGED, STOCKS_LIST_REQUESTED, STOCKS_PRICES_REQUESTED } from '~client/constants/actions';
import { API_PREFIX } from '~client/constants/data';
import { DO_STOCKS_LIST } from '~client/constants/stocks';
import { getPeriodMatch } from '~client/helpers/data';

import { aFundsGraphPeriodReceived } from '../actions/graph.actions';
import { aStocksListReceived, aStocksPricesReceived } from '../actions/stocks-list.actions';
import { getStockPricesFromYahoo } from '~client/helpers/finance';
import { getApiKey } from '~client/selectors/app';
import { getFundsCache } from '~client/selectors/funds/helpers';
import { getStocksListInfo } from '~client/selectors/funds/stocks';
import { openTimedMessage } from './error.saga';

export function *requestFundPeriodData({ shortPeriod, noCache }) {
    const cache = yield select(getFundsCache);

    const loadFromCache = !noCache && cache && cache.has(shortPeriod);
    if (loadFromCache) {
        return;
    }

    const apiKey = yield select(getApiKey);

    const { period, length } = getPeriodMatch(shortPeriod);
    const query = querystring.stringify({ period, length, history: true });

    try {
        const response = yield call(
            axios.get,
            `${API_PREFIX}/data/funds?${query}`,
            { headers: { Authorization: apiKey } }
        );

        const res = response.data.data;

        yield put(aFundsGraphPeriodReceived({ shortPeriod, res }));
    }
    catch (err) {
        yield call(openTimedMessage, 'Error loading fund data');
    }
}

export function *requestStocksList() {
    if (!DO_STOCKS_LIST) {
        return;
    }

    const apiKey = yield select(getApiKey);

    try {
        const response = yield call(
            axios.get,
            `${API_PREFIX}/data/stocks`,
            { headers: { 'Authorization': apiKey } }
        );

        yield put(aStocksListReceived(response.data.data));
    }
    catch (err) {
        yield put(aStocksListReceived(null));
    }
}

export function *requestStocksPrices() {
    const { stocks, indices } = yield select(getStocksListInfo);

    const symbols = stocks
        .reduce((codes, item, code) => codes.push(code), list.of())
        .concat(indices.reduce((codes, item) => codes.push(item.get('code')), list.of()));

    try {
        const data = yield call(getStockPricesFromYahoo, symbols);

        yield put(aStocksPricesReceived(data));
    }
    catch (err) {
        yield put(aStocksPricesReceived(null));
    }
}

export default function *fundsSaga() {
    yield all([
        takeEvery(GRAPH_FUNDS_PERIOD_CHANGED, requestFundPeriodData),
        takeEvery(STOCKS_LIST_REQUESTED, requestStocksList),
        takeEvery(STOCKS_PRICES_REQUESTED, requestStocksPrices)
    ]);
}

