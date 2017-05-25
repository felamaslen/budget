/**
 * Define side effects here (e.g. API calls)
 */

import { Map as map } from 'immutable';
import axios from 'axios';
import querystring from 'querystring';
import buildEffectHandler from '../effectHandlerBuilder';

import { ERROR_LEVEL_ERROR } from '../misc/const';

import {
  EF_LOGIN_FORM_SUBMIT
} from '../constants/effects';

import {
  aLoginFormResponseGot,
  aLoginFormReset
} from '../actions/LoginActions';
import {
  aErrorOpened
} from '../actions/ErrorActions';

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
    ).catch(error => {
      const message = map({
        text: `Login API error: ${error}`,
        level: ERROR_LEVEL_ERROR
      });
      dispatcher.dispatch(aErrorOpened(message));
      dispatcher.dispatch(aLoginFormReset(0));
    });
  }]
]);
