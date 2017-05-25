/*
 * Carries out actions for the Form component
 */

import Cookies from 'js-cookie';
import { rLoginFormSubmit } from './LoginFormReducer';
import { rLoadContent } from './ContentReducer';

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
 * Load cookies on app startup to remember settings
 * @param {Record} reduction application state
 * @returns {Record} modified reduction
 */
export const rLoadCookies = reduction => {
  let newReduction = reduction;

  // remember user logins
  const pin = Cookies.get('pin');
  if (pin && pin.match(/^[0-9]{4}$/)) {
    const values = pin.split('').map(item => parseInt(item, 10));
    newReduction = rLoginFormSubmit(
      newReduction.setIn(['appState', 'loading'], true)
      .setIn(['appState', 'loginForm', 'loadedCookie'], true)
      .setIn(['appState', 'loginForm', 'values'], values)
    );
  }

  const page = Cookies.get('page');
  if (page && page.match(/^[0-9]+$/)) {
    newReduction = newReduction.setIn(['appState', 'currentPageIndex'], parseInt(page, 10));
  }

  return newReduction;
};

/**
 * Navigate to a page (index)
 * @param {Record} reduction application state
 * @param {integer} page: page index to navigate to
 * @returns {Record} modified reduction
 */
export const rNavigateToPage = (reduction, page) => {
  Cookies.set('page', page, { expires: 7 });
  let newReduction = reduction;
  if (!newReduction.getIn(['appState', 'pagesLoaded', page])) {
    newReduction = rLoadContent(newReduction, page);
  }
  return newReduction.setIn(['appState', 'currentPageIndex'], page);
};

