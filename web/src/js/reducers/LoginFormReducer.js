/*
 * Carries out actions for the Form component
 */

import { Map as map } from 'immutable';
import Cookies from 'js-cookie';
import buildMessage from '../messageBuilder';
import {
  EF_LOGIN_FORM_SUBMIT
} from '../constants/effects';
import { LOGIN_INPUT_LENGTH, ERROR_LEVEL_ERROR } from '../misc/const';
import { rErrorMessageOpen } from './ErrorReducer';
import { rLoadContent } from './ContentReducer';

/**
 * submit the login form
 * @param {Record} reduction: app state
 * @returns {Record} new app state
 */
export const rLoginFormSubmit = reduction => {
  const pin = reduction.getIn(['appState', 'loginForm', 'values']).join('');
  return reduction.setIn(['appState', 'loginForm', 'loading'], true)
  .set('effects', reduction.get('effects').push(
    buildMessage(EF_LOGIN_FORM_SUBMIT, pin)
  ));
};

/**
 * put a digit on the login form PIN input
 * @param {Record} reduction: app state
 * @param {number} input: digit to add to the form
 * @returns {Record} new app state
 */
export const rLoginFormInput = (reduction, input) => {
  if (!input.match(/^[0-9]$/) || reduction.getIn(['appState', 'loginForm', 'loading'])) {
    // don't do anything if the input is non-numeric, or
    // we're still loading a login request
    return reduction;
  }
  const values = reduction.getIn(['appState', 'loginForm', 'values']);
  const newReduction = reduction.setIn(
    ['appState', 'loginForm', 'values'], values.push(input)
  ).setIn(
    ['appState', 'loginForm', 'inputStep'],
    reduction.getIn(['appState', 'loginForm', 'inputStep']) + 1
  );
  // if the pin is complete, submit the form
  return values.size < LOGIN_INPUT_LENGTH - 1 ? newReduction : rLoginFormSubmit(newReduction);
};

/**
 * reset the login form PIN input to a certain point
 * @param {Record} reduction: app state
 * @param {number} index: where to reset to
 * @returns {Record} new app state
 */
export const rLoginFormReset = (reduction, index) => {
  return reduction.setIn(
    ['appState', 'loginForm', 'values'],
    reduction.getIn(['appState', 'loginForm', 'values']).slice(0, index)
  ).setIn(['appState', 'loginForm', 'inputStep'], index);
};

/**
 * handle login form API response
 * @param {Record} reduction: app state
 * @param {object} output: pin and API response (JSON)
 * @returns {Record} new app state
 */
export const rLoginFormHandleResponse = (reduction, output) => {
  let newReduction = rLoginFormReset(
    reduction.setIn(['appState', 'loginForm', 'loading'], false)
    .setIn(['appState', 'loading'], false), 0);

  if (output.response.data.error) {
    const message = map({
      text: `Login error: ${output.response.data.errorText}`,
      level: ERROR_LEVEL_ERROR
    });
    return rErrorMessageOpen(newReduction, message);
  }

  // save a cookie to remember the session
  if (!newReduction.getIn(['appState', 'loginForm', 'loadedCookie'])) {
    Cookies.set('pin', output.pin, { expires: 7 });
  }

  // go to the first page after logging in
  let page = newReduction.getIn(['appState', 'currentPageIndex']);
  if (page < 0) {
    page = 0;
    newReduction = newReduction.setIn(['appState', 'currentPageIndex'], page);
  }

  // set user data
  newReduction = newReduction.setIn(['appState', 'user', 'uid'], output.response.data.uid)
  .setIn(['appState', 'user', 'name'], output.response.data.name)
  .setIn(['appState', 'user', 'apiKey'], output.response.data.api_key);

  // set side effect to load page data
  newReduction = rLoadContent(newReduction, page);

  return newReduction;
};

