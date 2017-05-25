/**
 * Define side effects here (e.g. API calls)
 */

import { } from 'immutable';
import axios from 'axios';
import querystring from 'querystring';
import buildEffectHandler from '../effectHandlerBuilder';

import {
  EF_LOGIN_FORM_SUBMIT
} from '../constants/effects';

import {
  aLoginFormResponseGot,
  aLoginFormReset
} from '../actions/LoginActions';

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
      console.error('Error submitting form', error); // TODO: global error handler function
      dispatcher.dispatch(aLoginFormReset(0));
    });
  }]
]);
