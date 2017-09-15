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

import { aServerUpdateReceived, aServerAddReceived } from '../actions/HeaderActions';
import { aLoginFormResponseGot } from '../actions/LoginActions';
import { aContentLoaded, aContentBlocksReceived } from '../actions/ContentActions';
import { aAnalysisDataReceived } from '../actions/AnalysisActions';
import { aSuggestionsReceived } from '../actions/EditActions';
import { aFundsPeriodLoaded } from '../actions/GraphActions';
import { aStocksListReceived, aStocksPricesReceived } from '../actions/StocksListActions';

const apiPrefix = `api/v${API_VERSION}`;

function submitLoginForm(pin, dispatcher) {
    return axios
        .post(`${apiPrefix}/user/login`, { pin })
        .then(
            response => dispatcher.dispatch(aLoginFormResponseGot({ response, pin }))
        )
        .catch(
            err => dispatcher.dispatch(aLoginFormResponseGot({ err }))
        );
}

function requestContent(req, dispatcher) {
    const pageIndex = req.pageIndex;

    const path = ['data', req.pageName].concat(req.dataReq || []);

    const query = (req.urlParam || []).reduce((items, item) => {
        items[item.name] = item.value;

        return items;
    }, {});

    return axios
        .get(`${apiPrefix}/${path.join('/')}?${querystring.stringify(query)}`, {
            headers: { 'Authorization': req.apiKey }
        })
        .then(
            response => dispatcher.dispatch(aContentLoaded(response, pageIndex))
        );
}

function requestBlocks(req, dispatcher) {
    const loadKey = req.loadKey;

    return axios
        .get(`${apiPrefix}/data/pie/${req.table}`, {
            headers: { 'Authorization': req.apiKey }
        })
        .then(
            response => dispatcher.dispatch(
                aContentBlocksReceived(response, loadKey)
            )
        );
}

function updateServerData(req, dispatcher) {
    return axios
        .patch(`${apiPrefix}/data/multiple`, { list: req.list }, {
            headers: { 'Authorization': req.apiKey }
        })
        .then(
            response => dispatcher.dispatch(aServerUpdateReceived(response))
        );
}

function addServerData(req, dispatcher) {
    return axios
        .post(`${apiPrefix}/data/${PAGES[req.pageIndex]}`, req.item, {
            headers: { 'Authorization': req.apiKey }
        })
        .then(
            response => dispatcher.dispatch(aServerAddReceived({
                response,
                item: req.theItems,
                pageIndex: req.pageIndex
            }))
        );
}

function requestAnalysisData(req, dispatcher) {
    const url = [
        apiPrefix,
        'data',
        'analysis',
        req.period,
        req.grouping,
        req.timeIndex
    ].join('/');

    return axios
        .get(url, {
            headers: { 'Authorization': req.apiKey }
        })
        .then(
            response => dispatcher.dispatch(aAnalysisDataReceived(response))
        );
}

function requestDeepAnalysisData(req, dispatcher) {
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

    return axios
        .get(url, {
            headers: { 'Authorization': req.apiKey }
        })
        .then(
            response => {
                const res = Object.assign({}, response, { deepBlock: req.name });

                return dispatcher.dispatch(aAnalysisDataReceived(res));
            }
        );
}

function requestFundPeriodData(req, dispatcher) {
    const query = querystring.stringify({
        period: req.period,
        length: req.length,
        history: true
    });

    return axios
        .get(`${apiPrefix}/data/funds?${query}`, {
            headers: { 'Authorization': req.apiKey }
        })
        .then(
            response => {
                const period = `${req.period}${req.length}`;
                const data = response.data.data;

                dispatcher.dispatch(aFundsPeriodLoaded({
                    reloadPagePrices: req.reloadPagePrices,
                    period,
                    data
                }));
            }
        );
}

function requestSuggestions(req, dispatcher) {
    const url = [
        apiPrefix,
        'data',
        'search',
        req.page,
        req.column,
        req.value,
        MAX_SUGGESTIONS
    ].join('/');

    return axios
        .get(url, {
            headers: { 'Authorization': req.apiKey }
        })
        .then(
            response => {
                if (!response.data.error) {
                    const items = list(response.data.data.list);
                    const reqId = req.reqId;
                    dispatcher.dispatch(aSuggestionsReceived({ items, reqId }));
                }
            }
        );
}

function requestStocksList(apiKey, dispatcher) {
    return axios
        .get(`${apiPrefix}/data/stocks`, {
            headers: { 'Authorization': apiKey }
        })
        .then(
            response => {
                if (!response.data.error) {
                    dispatcher.dispatch(aStocksListReceived(response.data.data));
                }
            }
        );
}

function requestStockPrices(req, dispatcher) {
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

    return Promise.all(promises)
        .then(responses => {
            const data = responses.map(response => response.data);

            return dispatcher.dispatch(aStocksPricesReceived(data));
        })
        .catch(err => {
            console.error('Error fetching stock prices', err.message);

            return dispatcher.dispatch(aStocksPricesReceived(null));
        });
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

