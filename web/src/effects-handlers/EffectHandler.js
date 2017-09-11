/**
 * Define side effects here (e.g. API calls)
 */

import axios from 'axios';
import jsonp from 'jsonp';
import querystring from 'querystring';
import { List as list } from 'immutable';
import buildEffectHandler from '../effectHandlerBuilder';

import { PAGES, MAX_SUGGESTIONS } from '../misc/const';
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

export default buildEffectHandler([
    /**
   * submit the user login form
   * @param {string} pin: the pin to send to the API for authorisation
   * @param {Dispatcher} dispatcher: action dispatcher
   * @returns {void}
   */
    [EF_LOGIN_FORM_SUBMIT, (pin, dispatcher) => {
        axios.post('api?t=login', querystring.stringify({ pin }))
            .then(
                response => dispatcher.dispatch(aLoginFormResponseGot({ response, pin }))
            )
            .catch(
                err => dispatcher.dispatch(aLoginFormResponseGot({ err }))
            );
    }],

    [EF_CONTENT_REQUESTED, (obj, dispatcher) => {
        const pageIndex = obj.pageIndex;
        const dataReq = ['data', obj.pageName].concat(obj.dataReq || []).join('/');
        const urlParam = { t: dataReq };
        if (obj.urlParam) {
            obj.urlParam.forEach(param => {
                urlParam[param.name] = param.value;
            });
        }
        const urlReq = querystring.stringify(urlParam);

        axios.get(`api?${urlReq}`, {
            headers: { 'Authorization': obj.apiKey }
        }).then(
            response => dispatcher.dispatch(aContentLoaded(response, pageIndex))
        );
    }],

    [EF_BLOCKS_REQUESTED, (obj, dispatcher) => {
        const loadKey = obj.loadKey;

        axios.get(`api?t=pie/${obj.table}`, {
            headers: { 'Authorization': obj.apiKey }
        }).then(
            response => dispatcher.dispatch(aContentBlocksReceived(response, loadKey))
        );
    }],

    [EF_SERVER_UPDATE_REQUESTED, (obj, dispatcher) => {
        axios.post('api?t=multiple', querystring.stringify({ list: obj.list }), {
            headers: { 'Authorization': obj.apiKey }
        }).then(
            response => dispatcher.dispatch(aServerUpdateReceived(response))
        );
    }],

    [EF_ANALYSIS_DATA_REQUESTED, (obj, dispatcher) => {
        axios.get(`api?t=data/analysis/${obj.period}/${obj.grouping}/${obj.timeIndex}`, {
            headers: { 'Authorization': obj.apiKey }
        }).then(
            response => dispatcher.dispatch(aAnalysisDataReceived(response))
        );
    }],

    [EF_ANALYSIS_EXTRA_REQUESTED, (obj, dispatcher) => {
        axios.get(`api?t=data/analysis_category/${obj.name}/${obj.period}/${obj.grouping}/${obj.timeIndex}`, {
            headers: { 'Authorization': obj.apiKey }
        }).then(
            response => {
                const resObj = response;
                resObj.deepBlock = obj.name;
                dispatcher.dispatch(aAnalysisDataReceived(resObj));
            }
        );
    }],

    [EF_SERVER_ADD_REQUESTED, (obj, dispatcher) => {
        axios.post(`api?t=add/${PAGES[obj.pageIndex]}`, querystring.stringify(obj.item), {
            headers: { 'Authorization': obj.apiKey }
        }).then(
            response => dispatcher.dispatch(aServerAddReceived({
                response,
                item: obj.theItems,
                pageIndex: obj.pageIndex
            }))
        );
    }],

    [EF_FUNDS_PERIOD_REQUESTED, (obj, dispatcher) => {
        axios.get(`api?t=data/fund_history&period=${obj.period}`, {
            headers: { 'Authorization': obj.apiKey }
        }).then(
            response => {
                const period = obj.period;
                const data = response;
                dispatcher.dispatch(aFundsPeriodLoaded({ period, data }));
            }
        );
    }],

    [EF_SUGGESTIONS_REQUESTED, (obj, dispatcher) => {
        axios.get(`api?t=data/search/${obj.page}/${obj.column}/${obj.value}/${MAX_SUGGESTIONS}`, {
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
        axios.get('api?t=data/stocks', {
            headers: { 'Authorization': apiKey }
        }).then(
            response => {
                if (!response.data.error) {
                    dispatcher.dispatch(aStocksListReceived(response.data.data));
                }
            }
        );
    }],

    [EF_STOCKS_PRICES_REQUESTED, (symbols, dispatcher) => {
        jsonp(`https://www.google.com/finance/info?client=ig&q=${symbols}`, null, (error, data) => {
            if (error) {
                console.error(error.message);
            }
            dispatcher.dispatch(aStocksPricesReceived(data));
        });
    }]
]);
