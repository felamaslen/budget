/**
 * Define side effects here (e.g. API calls)
 */

import axios from 'axios';
import querystring from 'querystring';
import { List as list } from 'immutable';
import buildEffectHandler from '../effectHandlerBuilder';

import { PAGES, MAX_SUGGESTIONS, API_VERSION } from '../misc/const';
import * as ef from '../constants/effects';

import { aErrorOpened } from '../actions/ErrorActions';

import { aServerUpdateReceived, aServerAddReceived } from '../actions/HeaderActions';
import { aLoginFormResponseGot } from '../actions/LoginActions';
import { aContentLoaded } from '../actions/ContentActions';
import { aAnalysisDataReceived } from '../actions/AnalysisActions';
import { aSuggestionsReceived } from '../actions/EditActions';
import { aFundsPeriodLoaded } from '../actions/GraphActions';
import { aStocksListReceived, aStocksPricesReceived } from '../actions/StocksListActions';

const apiPrefix = `api/v${API_VERSION}`;

async function submitLoginForm(pin, dispatcher) {
    try {
        const response = await axios.post(`${apiPrefix}/user/login`, { pin });

        return dispatcher.dispatch(aLoginFormResponseGot({ response, pin }));
    }
    catch (err) {
        return dispatcher.dispatch(aLoginFormResponseGot({ err }));
    }
}

function getLoginCredentials(payload, dispatcher) {
    if (!localStorage || !localStorage.getItem) {
        return null;
    }

    const pin = localStorage.getItem('pin');

    if (pin) {
        return submitLoginForm(parseInt(pin, 10), dispatcher);
    }

    setTimeout(() => {
        dispatcher.dispatch(aLoginFormResponseGot(null));
    }, 0);

    return null;
}

function saveLoginCredentials(pin) {
    if (!localStorage || !localStorage.getItem) {
        return null;
    }

    if (!pin) {
        return localStorage.removeItem('pin');
    }

    return localStorage.setItem('pin', pin);
}

async function requestContent(req, dispatcher) {
    const pageIndex = req.pageIndex;

    const path = ['data', req.pageName].concat(req.dataReq || []);

    const query = (req.urlParam || []).reduce((items, item) => {
        items[item.name] = item.value;

        return items;
    }, {});

    const url = [
        apiPrefix,
        path.join('/'),
        `?${querystring.stringify(query)}`
    ].join('/');

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': req.apiKey }
        });

        return dispatcher.dispatch(aContentLoaded(response, pageIndex));
    }
    catch (err) {
        return dispatcher.dispatch(aErrorOpened('An error occurred loading content'));
    }
}

async function updateServerData(req, dispatcher) {
    try {
        const response = await axios.patch(`${apiPrefix}/data/multiple`, {
            list: req.list
        }, {
            headers: { 'Authorization': req.apiKey }
        });

        return dispatcher.dispatch(aServerUpdateReceived(response));
    }
    catch (err) {
        return dispatcher.dispatch(aErrorOpened('Error updating data on server!'));
    }
}

async function addServerData(req, dispatcher) {
    try {
        const response = await axios.post(`${apiPrefix}/data/${PAGES[req.pageIndex]}`, req.item, {
            headers: { 'Authorization': req.apiKey }
        });

        return dispatcher.dispatch(aServerAddReceived({
            response,
            item: req.fields,
            pageIndex: req.pageIndex
        }));
    }
    catch (err) {
        return dispatcher.dispatch(aErrorOpened('Error adding data to server!'));
    }
}

async function requestAnalysisData(req, dispatcher) {
    const url = [
        apiPrefix,
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

        return dispatcher.dispatch(aAnalysisDataReceived(response));
    }
    catch (err) {
        return dispatcher.dispatch(aErrorOpened('Error loading analysis blocks'));
    }
}

async function requestDeepAnalysisData(req, dispatcher) {
    const url = [
        apiPrefix,
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

        return dispatcher.dispatch(aAnalysisDataReceived(res));
    }
    catch (err) {
        return dispatcher.dispatch(aErrorOpened('Error loading analysis blocks'));
    }
}

async function requestFundPeriodData(req, dispatcher) {
    const query = querystring.stringify({
        period: req.period,
        length: req.length,
        history: true
    });

    try {
        const response = await axios.get(`${apiPrefix}/data/funds?${query}`, {
            headers: { 'Authorization': req.apiKey }
        });

        const period = `${req.period}${req.length}`;
        const data = response.data.data;

        return dispatcher.dispatch(aFundsPeriodLoaded({
            reloadPagePrices: req.reloadPagePrices,
            period,
            data
        }));
    }
    catch (err) {
        return dispatcher.dispatch(aErrorOpened('Error loading fund data'));
    }
}

async function requestSuggestions(req, dispatcher) {
    const url = [
        apiPrefix,
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

        return dispatcher.dispatch(aSuggestionsReceived({ items, reqId }));
    }
    catch (err) {
        console.warn('Error loading search suggestions');

        return null;
    }
}

async function requestStocksList(apiKey, dispatcher) {
    try {
        const response = await axios.get(`${apiPrefix}/data/stocks`, {
            headers: { 'Authorization': apiKey }
        });

        return dispatcher.dispatch(aStocksListReceived(response.data.data));
    }
    catch (err) {
        return dispatcher.dispatch(aStocksListReceived(null));
    }
}

async function requestStockPrices(req, dispatcher) {
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

        return dispatcher.dispatch(aStocksPricesReceived(data));
    }
    catch (err) {
        console.error('Error fetching stock prices', err.message);

        return dispatcher.dispatch(aStocksPricesReceived(null));
    }
}

export default buildEffectHandler([
    [ef.EF_LOGIN_FORM_SUBMIT, submitLoginForm],
    [ef.EF_LOGIN_CREDENTIALS_RETRIEVED, getLoginCredentials],
    [ef.EF_LOGIN_CREDENTIALS_SAVED, saveLoginCredentials],

    [ef.EF_CONTENT_REQUESTED, requestContent],
    [ef.EF_SERVER_UPDATE_REQUESTED, updateServerData],
    [ef.EF_SERVER_ADD_REQUESTED, addServerData],

    [ef.EF_ANALYSIS_DATA_REQUESTED, requestAnalysisData],
    [ef.EF_ANALYSIS_EXTRA_REQUESTED, requestDeepAnalysisData],

    [ef.EF_FUNDS_PERIOD_REQUESTED, requestFundPeriodData],
    [ef.EF_STOCKS_LIST_REQUESTED, requestStocksList],
    [ef.EF_STOCKS_PRICES_REQUESTED, requestStockPrices],

    [ef.EF_SUGGESTIONS_REQUESTED, requestSuggestions]
]);

