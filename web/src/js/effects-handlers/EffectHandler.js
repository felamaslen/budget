/**
 * Define side effects here (e.g. API calls)
 */

import axios from 'axios';
import querystring from 'querystring';
import buildEffectHandler from '../effectHandlerBuilder';

import { PAGES } from '../misc/const';
import {
  EF_LOGIN_FORM_SUBMIT, EF_CONTENT_REQUESTED,
  EF_SERVER_UPDATE_REQUESTED, EF_SERVER_ADD_REQUESTED,
  EF_FUNDS_PERIOD_REQUESTED
} from '../constants/effects';

import { aServerUpdateReceived, aServerAddReceived } from '../actions/HeaderActions';
import { aLoginFormResponseGot } from '../actions/LoginActions';
import { aContentLoaded } from '../actions/ContentActions';
import { aFundsPeriodLoaded } from '../actions/GraphActions';

export default buildEffectHandler([
  /**
   * submit the user login form
   * @param {string} pin: the pin to send to the API for authorisation
   * @param {Dispatcher} dispatcher: action dispatcher
   * @returns {void}
   */
  [EF_LOGIN_FORM_SUBMIT, (pin, dispatcher) => {
    axios.post('api?t=login', querystring.stringify({ pin })).then(
      response => dispatcher.dispatch(aLoginFormResponseGot({ response, pin }))
    );
  }],

  [EF_CONTENT_REQUESTED, (obj, dispatcher) => {
    const pageIndex = obj.pageIndex;
    const urlParam = { t: `data/${obj.pageName}` };
    if (obj.urlParam) {
      obj.urlParam.forEach(param => {
        urlParam[param.name] = param.value;
      });
    }
    const urlReq = querystring.stringify(urlParam);

    axios.get(`api?${urlReq}`, {
      headers: { 'Authorization': obj.apiKey }
    }).then(
      response => dispatcher.dispatch(aContentLoaded({ response, pageIndex }))
    );
  }],

  [EF_SERVER_UPDATE_REQUESTED, (obj, dispatcher) => {
    axios.post('api?t=multiple', querystring.stringify({ list: obj.list }), {
      headers: { 'Authorization': obj.apiKey }
    }).then(
      response => dispatcher.dispatch(aServerUpdateReceived(response))
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
  }]
]);
