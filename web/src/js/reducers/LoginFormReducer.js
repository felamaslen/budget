/*
 * Carries out actions for the Form component
 */

import buildMessage from '../messageBuilder';
import {
  EF_LOGIN_FORM_SUBMIT
} from '../constants/effects';
import { LOGIN_INPUT_LENGTH } from '../misc/const';

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
  if (reduction.getIn(['appState', 'loginForm', 'loading'])) {
    // don't do anything if we're still loading a login request
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
 * @param {object} response: API response (JSON)
 * @returns {Record} new app state
 */
export const rLoginFormHandleResponse = (reduction, response) => {
  const newReduction = rLoginFormReset(reduction.setIn(
    ['appState', 'loginForm', 'loading'], false), 0);
  if (response.data.error) {
    // error logging in (TODO: global error handling)
    return newReduction;
  }
  return newReduction.setIn(['appState', 'user', 'uid'], response.data.uid)
  .setIn(['appState', 'user', 'name'], response.data.name)
  .setIn(['appState', 'user', 'apiKey'], response.data.api_key);
};

