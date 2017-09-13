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

export default buildEffectHandler([
    /**
   * submit the user login form
   * @param {string} pin: the pin to send to the API for authorisation
   * @param {Dispatcher} dispatcher: action dispatcher
   * @returns {void}
   */
    [EF_LOGIN_FORM_SUBMIT, (pin, dispatcher) => {
        axios.post(`${apiPrefix}/user/login`, { pin })
            .then(
                response => dispatcher.dispatch(aLoginFormResponseGot({ response, pin }))
            )
            .catch(
                err => dispatcher.dispatch(aLoginFormResponseGot({ err }))
            );
    }],

    [EF_CONTENT_REQUESTED, (obj, dispatcher) => {
        const pageIndex = obj.pageIndex;

        const path = ['data', obj.pageName].concat(obj.dataReq || []);

        const query = (obj.urlParam || []).reduce((items, item) => {
            items[item.name] = item.value;

            return items;
        }, {});

        axios.get(`${apiPrefix}/${path.join('/')}?${querystring.stringify(query)}`, {
            headers: { 'Authorization': obj.apiKey }
        }).then(
            response => dispatcher.dispatch(aContentLoaded(response, pageIndex))
        );
    }],

    [EF_BLOCKS_REQUESTED, (obj, dispatcher) => {
        const loadKey = obj.loadKey;

        axios.get(`${apiPrefix}/data/pie/${obj.table}`, {
            headers: { 'Authorization': obj.apiKey }
        }).then(
            response => dispatcher.dispatch(aContentBlocksReceived(response, loadKey))
        );
    }],

    [EF_SERVER_UPDATE_REQUESTED, (req, dispatcher) => {
        axios.patch(`${apiPrefix}/data/multiple`, { list: req.list }, {
            headers: { 'Authorization': req.apiKey }
        }).then(
            response => dispatcher.dispatch(aServerUpdateReceived(response))
        );
    }],

    [EF_ANALYSIS_DATA_REQUESTED, (req, dispatcher) => {
        axios.get(`${apiPrefix}/data/analysis/${req.period}/${req.grouping}/${req.timeIndex}`, {
            headers: { 'Authorization': req.apiKey }
        }).then(
            response => dispatcher.dispatch(aAnalysisDataReceived(response))
        );
    }],

    [EF_ANALYSIS_EXTRA_REQUESTED, (req, dispatcher) => {
        axios.get(`${apiPrefix}/data/analysis/deep/${req.name}/${req.period}/${req.grouping}/${req.timeIndex}`, {
            headers: { 'Authorization': req.apiKey }
        }).then(
            response => {
                const res = Object.assign({}, response, { deepBlock: req.name });

                return dispatcher.dispatch(aAnalysisDataReceived(res));
            }
        );
    }],

    [EF_SERVER_ADD_REQUESTED, (req, dispatcher) => {
        axios.post(`${apiPrefix}/data/${PAGES[req.pageIndex]}`, req.item, {
            headers: { 'Authorization': req.apiKey }
        }).then(
            response => dispatcher.dispatch(aServerAddReceived({
                response,
                item: req.theItems,
                pageIndex: req.pageIndex
            }))
        );
    }],

    [EF_FUNDS_PERIOD_REQUESTED, (req, dispatcher) => {
        const query = querystring.stringify({
            period: req.period,
            length: req.length,
            history: true
        });

        axios.get(`${apiPrefix}/data/funds?${query}`, {
            headers: { 'Authorization': req.apiKey }
        }).then(
            response => {
                const period = `${req.period}${req.length}`;
                const data = response.data.data;

                dispatcher.dispatch(aFundsPeriodLoaded({ period, data }));
            }
        );
    }],

    [EF_SUGGESTIONS_REQUESTED, (obj, dispatcher) => {
        axios.get(`${apiPrefix}/data/search/${obj.page}/${obj.column}/${obj.value}/${MAX_SUGGESTIONS}`, {
            headers: { 'Authorization': obj.apiKey }
        }).then(
            response => {
                if (!response.data.error) {
                    const items = list(response.data.data.list);
                    const reqId = obj.reqId;
                    dispatcher.dispatch(aSuggestionsReceived({ items, reqId }));
                }
            }
        );
    }],

    [EF_STOCKS_LIST_REQUESTED, (apiKey, dispatcher) => {
        axios.get(`${apiPrefix}/data/stocks`, {
            headers: { 'Authorization': apiKey }
        }).then(
            response => {
                if (!response.data.error) {
                    dispatcher.dispatch(aStocksListReceived(response.data.data));
                }
            }
        );
    }],

    [EF_STOCKS_PRICES_REQUESTED, (req, dispatcher) => {
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
    }]
]);
