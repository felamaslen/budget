/**
 * Define side effects here (e.g. API calls)
 */

import axios from 'axios';
import querystring from 'querystring';
import buildEffectHandler from '../effectHandlerBuilder';

import {
  EF_LOGIN_FORM_SUBMIT, EF_CONTENT_REQUESTED, EF_SERVER_UPDATE_REQUESTED
} from '../constants/effects';

import { aServerUpdateReceived } from '../actions/HeaderActions';
import { aLoginFormResponseGot } from '../actions/LoginActions';
import { aContentLoaded } from '../actions/ContentActions';

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
    axios.get(`api?t=data/${obj.pageName}`, {
      headers: { 'Authorization': obj.apiKey }
    }).then(
      response => dispatcher.dispatch(aContentLoaded({ response, page: obj.page }))
    );
  }],

  [EF_SERVER_UPDATE_REQUESTED, (obj, dispatcher) => {
    axios.post('api?t=multiple', querystring.stringify({ list: obj.list }), {
      headers: { 'Authorization': obj.apiKey }
    }).then(
      response => dispatcher.dispatch(aServerUpdateReceived(response))
    );
  }]

]);
