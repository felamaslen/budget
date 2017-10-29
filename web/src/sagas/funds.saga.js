import { List as list } from 'immutable';
import { select, put } from 'redux-saga/effects';
import axios from 'axios';
import querystring from 'querystring';

import { API_PREFIX } from '../misc/const';
import { getPeriodMatch } from '../misc/data';

import { aFundsGraphPeriodReceived } from '../actions/graph.actions';
import { aStocksListReceived, aStocksPricesReceived } from '../actions/stocks-list.actions';
import { getStockPricesFromYahoo } from '../misc/finance';

import { openTimedMessage } from './error.saga';

export function *requestFundPeriodData({ payload }) {
    const { shortPeriod, reloadPagePrices, noCache } = payload;

    const loadFromCache = yield select(state => !noCache && state
        .getIn(['other', 'fundHistoryCache'])
        .has(shortPeriod)
    );

    if (loadFromCache) {
        return;
    }

    const apiKey = yield select(state => state.getIn(['user', 'apiKey']));

    const { period, length } = getPeriodMatch(shortPeriod);
    const query = querystring.stringify({ period, length, history: true });

    try {
        const response = yield axios.get(
            `${API_PREFIX}/data/funds?${query}`,
            { headers: { 'Authorization': apiKey } }
        );

        const data = response.data.data;

        yield put(aFundsGraphPeriodReceived({ reloadPagePrices, shortPeriod, data }));
    }
    catch (err) {
        yield openTimedMessage('Error loading fund data');
    }
}

export function *requestStocksList() {
    const apiKey = yield select(state => state.getIn(['user', 'apiKey']));

    try {
        const response = yield axios.get(
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
    let symbols = yield select(state => state.getIn(['other', 'stocksList', 'stocks']));
    const indices = yield select(state => state.getIn(['other', 'stocksList', 'indices']));

    symbols = symbols
        .reduce((codes, item, code) => codes.push(code), list.of())
        .concat(indices.reduce((codes, item) => codes.push(item.get('code')), list.of()));

    try {
        const data = yield getStockPricesFromYahoo(symbols);

        yield put(aStocksPricesReceived(data));
    }
    catch (err) {
        yield put(aStocksPricesReceived(null));
    }
}

