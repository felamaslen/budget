/**
 * Define side effects here (e.g. API calls)
 */

import axios from 'axios';
import querystring from 'querystring';
import { List as list } from 'immutable';
import buildEffectHandler from '../effectHandlerBuilder';

import { PAGES, MAX_SUGGESTIONS, API_VERSION } from '../misc/const';
import {
    EF_LOGIN_FORM_SUBMIT,
    EF_CONTENT_REQUESTED, EF_BLOCKS_REQUESTED,
    EF_ANALYSIS_DATA_REQUESTED, EF_ANALYSIS_EXTRA_REQUESTED,
    EF_SERVER_UPDATE_REQUESTED, EF_SERVER_ADD_REQUESTED,
    EF_FUNDS_PERIOD_REQUESTED, EF_SUGGESTIONS_REQUESTED,
    EF_STOCKS_LIST_REQUESTED, EF_STOCKS_PRICES_REQUESTED
} from '../constants/effects';

import { aErrorOpened } from '../actions/ErrorActions';

import { aServerUpdateReceived, aServerAddReceived } from '../actions/HeaderActions';
import { aLoginFormResponseGot } from '../actions/LoginActions';
import { aContentLoaded, aContentBlocksReceived } from '../actions/ContentActions';
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

async function requestBlocks(req, dispatcher) {
    const loadKey = req.loadKey;

    try {
        const response = await axios.get(`${apiPrefix}/data/pie/${req.table}`, {
            headers: { 'Authorization': req.apiKey }
        });

        return dispatcher.dispatch(aContentBlocksReceived(response, loadKey));
    }
    catch (err) {
        console.warn('Error loading block data for list');

        return null;
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
            item: req.theItems,
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
    [EF_LOGIN_FORM_SUBMIT, submitLoginForm],

    [EF_CONTENT_REQUESTED, requestContent],

    [EF_BLOCKS_REQUESTED, requestBlocks],

    [EF_SERVER_UPDATE_REQUESTED, updateServerData],

    [EF_ANALYSIS_DATA_REQUESTED, requestAnalysisData],

    [EF_ANALYSIS_EXTRA_REQUESTED, requestDeepAnalysisData],

    [EF_SERVER_ADD_REQUESTED, addServerData],

    [EF_FUNDS_PERIOD_REQUESTED, requestFundPeriodData],

    [EF_SUGGESTIONS_REQUESTED, requestSuggestions],

    [EF_STOCKS_LIST_REQUESTED, requestStocksList],

    [EF_STOCKS_PRICES_REQUESTED, requestStockPrices]
]);

