/**
 * Define side effects here (e.g. API calls)
 */

import axios from 'axios';
import querystring from 'querystring';
import { List as list } from 'immutable';

import { PAGES, MAX_SUGGESTIONS, API_PREFIX } from '../misc/const';

import { aErrorOpened } from '../actions/ErrorActions';

import { aServerAddReceived } from '../actions/AppActions';
import { aAnalysisDataReceived } from '../actions/AnalysisActions';
import { aSuggestionsReceived } from '../actions/EditActions';
import { aFundsPeriodLoaded } from '../actions/GraphActions';
import { aStocksListReceived, aStocksPricesReceived } from '../actions/StocksListActions';

export function updateServerData({ apiKey, requestList }) {
    return axios.patch(
        `${API_PREFIX}/data/multiple`,
        { list: requestList },
        { headers: { 'Authorization': apiKey } }
    );
}

export async function addServerData(dispatch, req) {
    try {
        const response = await axios.post(`${API_PREFIX}/data/${PAGES[req.pageIndex]}`, req.item, {
            headers: { 'Authorization': req.apiKey }
        });

        return dispatch(aServerAddReceived({
            response,
            item: req.fields,
            pageIndex: req.pageIndex
        }));
    }
    catch (err) {
        return dispatch(aErrorOpened('Error adding data to server!'));
    }
}

export async function requestAnalysisData(dispatch, req) {
    const url = [
        API_PREFIX,
        'data',
        'analysis',
        req.period,
        req.grouping,
        req.timeIndex
    ].join('/');

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': req.apiKey }
        });

        return dispatch(aAnalysisDataReceived(response));
    }
    catch (err) {
        return dispatch(aErrorOpened('Error loading analysis blocks'));
    }
}

export async function requestDeepAnalysisData(dispatch, req) {
    const url = [
        API_PREFIX,
        'data',
        'analysis',
        'deep',
        req.name,
        req.period,
        req.grouping,
        req.timeIndex
    ].join('/');

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': req.apiKey }
        });

        const res = Object.assign({}, response, { deepBlock: req.name });

        return dispatch(aAnalysisDataReceived(res));
    }
    catch (err) {
        return dispatch(aErrorOpened('Error loading analysis blocks'));
    }
}

export async function requestFundPeriodData(dispatch, req) {
    const query = querystring.stringify({
        period: req.period,
        length: req.length,
        history: true
    });

    try {
        const response = await axios.get(`${API_PREFIX}/data/funds?${query}`, {
            headers: { 'Authorization': req.apiKey }
        });

        const period = `${req.period}${req.length}`;
        const data = response.data.data;

        return dispatch(aFundsPeriodLoaded({
            reloadPagePrices: req.reloadPagePrices,
            period,
            data
        }));
    }
    catch (err) {
        return dispatch(aErrorOpened('Error loading fund data'));
    }
}

export async function requestSuggestions(dispatch, req) {
    const url = [
        API_PREFIX,
        'data',
        'search',
        req.page,
        req.column,
        req.value,
        MAX_SUGGESTIONS
    ].join('/');

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': req.apiKey }
        });

        const items = list(response.data.data.list);
        const reqId = req.reqId;

        return dispatch(aSuggestionsReceived({ items, reqId }));
    }
    catch (err) {
        console.warn('Error loading search suggestions');

        return null;
    }
}

export async function requestStocksList(dispatch, apiKey) {
    try {
        const response = await axios.get(`${API_PREFIX}/data/stocks`, {
            headers: { 'Authorization': apiKey }
        });

        return dispatch(aStocksListReceived(response.data.data));
    }
    catch (err) {
        return dispatch(aStocksListReceived(null));
    }
}

export async function requestStockPrices(dispatch, req) {
    const promises = req.symbols.map(symbol => {
        const url = 'https://www.alphavantage.co/query';
        const query = {
            function: 'TIME_SERIES_DAILY',
            symbol,
            apikey: req.apiKey,
            datatype: 'json'
        };

        const requestUrl = `${url}?${querystring.stringify(query)}`;

        return axios.get(requestUrl);
    });

    try {
        const responses = await Promise.all(promises);

        const data = responses.map(response => response.data);

        return dispatch(aStocksPricesReceived(data));
    }
    catch (err) {
        console.error('Error fetching stock prices', err.message);

        return dispatch(aStocksPricesReceived(null));
    }
}

