/*
 * Carries out actions for the Form component
 */

import Cookies from 'js-cookie';
import { rLoginFormSubmit } from './LoginFormReducer';

/**
 * Log out of the system
 * @param {Record} reduction application state
 * @returns {Record} modified reduction
 */
export const rLogout = reduction => {
  Cookies.remove('pin');
  return reduction.setIn(['appState', 'user', 'uid'], 0)
  .setIn(['appState', 'user', 'name'], null)
  .setIn(['appState', 'user', 'apiKey'], null);
};

/**
 * Check user pin cookie to remember logins
 * @param {Record} reduction application state
 * @returns {Record} modified reduction
 */
export const rCheckUserCookie = reduction => {
  const pin = Cookies.get('pin');
  if (!pin || !pin.match(/^[0-9]{4}$/)) {
    return reduction;
  }
  return rLoginFormSubmit(
    reduction.setIn(['appState', 'loading'], true).setIn(
    ['appState', 'loginForm', 'values'],
    pin.split('').map(item => parseInt(item, 10)))
  );
};

