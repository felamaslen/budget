/*
 * Carries out actions for the Form component
 */

import { List as list } from 'immutable';
import Cookies from 'js-cookie';
import buildMessage from '../messageBuilder';
import { rLoginFormSubmit, rLoginFormReset, rLoginFormInput } from './LoginFormReducer';
import { rLoadContent } from './ContentReducer';
import { rActivateEditable } from './EditReducer';
import { EF_SERVER_UPDATE_REQUESTED } from '../constants/effects';
import {
  PAGES,
  SERVER_UPDATE_REQUESTED, SERVER_UPDATE_ERROR, SERVER_UPDATE_RECEIVED
} from '../misc/const';
import { buildQueueRequestList } from '../misc/data';

/**
 * Handle navigation
 * @param {Record} reduction application state
 * @param {integer} dx x direction
 * @param {integer} dy y direction
 * @returns {Record} modified reduction
 */
const handleNav = (reduction, dx, dy) => {
  const editing = reduction.getIn(['appState', 'edit', 'active']);
  if (dx === null) {
    return rActivateEditable(reduction, null);
  }
  const pageIndex = reduction.getIn(['appState', 'currentPageIndex']);
  const numRows = reduction.getIn(['appState', 'pages', pageIndex, 'data', 'numRows']);
  const numCols = reduction.getIn(['appState', 'pages', pageIndex, 'data', 'numCols']);
  if (!numRows || !numCols || !editing) {
    return reduction;
  }

  const newRow = (editing.get('row') + dy +
                  Math.floor((editing.get('col') + dx) / numCols)) % numRows;
  const newCol = (editing.get('col') + dx) % numCols;

  return rActivateEditable(reduction, editing)
  .setIn(['appState', 'edit', 'active', 'row'], newRow)
  .setIn(['appState', 'edit', 'active', 'col'], newCol);
};

/**
 * Handle key presses
 * @param {Record} reduction application state
 * @param {string} key which key was pressed
 * @returns {Record} modified reduction
 */
export const rHandleKeyPress = (reduction, key) => {
  if (reduction.getIn(['appState', 'user', 'uid'])) {
    // logged in

    // handle navigation
    if (key.key === 'Tab') {
      return handleNav(reduction, key.shift ? -1 : 1, 0);
    }
    if (key.ctrl) {
      const arrows = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
      const arrowIndex = arrows.indexOf(key.key);
      if (arrowIndex > -1) {
        return handleNav(reduction, ((arrowIndex % 4) - 1) % 2, (((arrowIndex - 1) % 4) - 1) % 2);
      }
    }
    if (key.key === 'Escape') {
      return handleNav(reduction, null);
    }
    return reduction;
  }
  // not logged in
  if (key.key === 'Escape') {
    return rLoginFormReset(reduction, 0);
  }
  return rLoginFormInput(reduction, key.key);
};

/**
 * Log out of the system
 * @param {Record} reduction application state
 * @returns {Record} modified reduction
 */
export const rLogout = reduction => {
  Cookies.remove('pin');
  return reduction.setIn(['appState', 'loginForm', 'values'], list.of())
  .setIn(['appState', 'user', 'uid'], 0)
  .setIn(['appState', 'user', 'name'], null)
  .setIn(['appState', 'user', 'apiKey'], null)
  .setIn(['appState', 'pages'], list(PAGES.map(() => null)))
  .setIn(['appState', 'pagesLoaded'], list(PAGES.map(() => false)));
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

export const rUpdateServer = reduction => {
  const queue = reduction.getIn(['appState', 'edit', 'queue']);
  if (queue.size === 0) {
    // toggle the status to trigger another (delayed) update
    return reduction.setIn(
      ['appState', 'edit', 'status'],
      (reduction.getIn(['appState', 'edit', 'status']) + 1) & 1
    );
  }

  const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);
  const startYearMonth = reduction.getIn(['appState', 'pages', 0, 'data', 'startYearMonth']);
  const reqList = buildQueueRequestList(queue, startYearMonth);
  const req = { apiKey, list: reqList };

  return reduction.setIn(['appState', 'edit', 'status'], SERVER_UPDATE_REQUESTED)
  .set('effects', reduction.get('effects').push(buildMessage(EF_SERVER_UPDATE_REQUESTED, req)));
};

export const rHandleServerUpdate = (reduction, response) => {
  const status = response.data.error ? SERVER_UPDATE_ERROR : SERVER_UPDATE_RECEIVED;
  let newReduction = reduction.setIn(['appState', 'edit', 'status'], status);
  if (!response.data.error) {
    newReduction = newReduction.setIn(['appState', 'edit', 'queue'], list.of());
  }
  return newReduction;
};

