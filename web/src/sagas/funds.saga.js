import { List as list } from 'immutable';
import { all, select, takeEvery, call, put } from 'redux-saga/effects';
import axios from 'axios';
import querystring from 'querystring';

import { GRAPH_FUNDS_PERIOD_CHANGED, STOCKS_LIST_REQUESTED, STOCKS_PRICES_REQUESTED } from '../constants/actions';
import { API_PREFIX } from '../constants/data';
import { DO_STOCKS_LIST } from '../constants/stocks';
import { getPeriodMatch } from '../misc/data';

import { aFundsGraphPeriodReceived } from '../actions/graph.actions';
import { aStocksListReceived, aStocksPricesReceived } from '../actions/stocks-list.actions';
import { getStockPricesFromYahoo } from '../misc/finance';

import { selectApiKey } from '.';
import { openTimedMessage } from './error.saga';

export const selectFundHistoryCache = state => state.getIn(['other', 'fundHistoryCache']);

export function *requestFundPeriodData({ shortPeriod, reloadPagePrices, noCache }) {
    const fundHistoryCache = yield select(selectFundHistoryCache);

    const loadFromCache = !noCache && fundHistoryCache.has(shortPeriod);
    if (loadFromCache) {
        return;
    }

    const apiKey = yield select(selectApiKey);

    const { period, length } = getPeriodMatch(shortPeriod);
    const query = querystring.stringify({ period, length, history: true });

    try {
        const response = yield call(
            axios.get,
            `${API_PREFIX}/data/funds?${query}`,
            { headers: { Authorization: apiKey } }
        );

        const data = response.data.data;

        yield put(aFundsGraphPeriodReceived({ reloadPagePrices, shortPeriod, data }));
    }
    catch (err) {
        yield call(openTimedMessage, 'Error loading fund data');
    }
}

export function *requestStocksList() {
    if (!DO_STOCKS_LIST) {
        return;
    }

    const apiKey = yield select(selectApiKey);

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

export const selectStocksListInfo = state => ({
    stocks: state.getIn(['other', 'stocksList', 'stocks']),
    indices: state.getIn(['other', 'stocksList', 'indices'])
});

export function *requestStocksPrices() {
    const { stocks, indices } = yield select(selectStocksListInfo);

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

