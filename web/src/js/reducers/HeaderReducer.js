/*
 * Carries out actions for the Form component
 */

import { List as list, Map as map } from 'immutable';
import Cookies from 'js-cookie';
import buildMessage from '../messageBuilder';
import { rLoginFormSubmit, rLoginFormReset, rLoginFormInput } from './LoginFormReducer';
import { rLoadContent } from './ContentReducer';
import { rActivateEditable } from './EditReducer';
import { EF_SERVER_UPDATE_REQUESTED } from '../constants/effects';
import {
  PAGES, LIST_PAGES, LIST_COLS_PAGES,
  SERVER_UPDATE_REQUESTED, SERVER_UPDATE_ERROR, SERVER_UPDATE_RECEIVED
} from '../misc/const';
import { buildQueueRequestList, getNullEditable, getAddDefaultValues } from '../misc/data';

const getItemValue = (reduction, pageIndex, row, col) => {
  let id = null;
  let item = null;
  let value = null;
  if (PAGES[pageIndex] === 'overview') {
    value = reduction.getIn(['appState', 'pages', pageIndex, 'data', 'cost', 'balance', row]);
  }
  else if (LIST_PAGES.indexOf(pageIndex) > -1 && row > -1) {
    id = reduction.getIn(['appState', 'pages', pageIndex, 'rows', row, 'id']);
    value = reduction.getIn(['appState', 'pages', pageIndex, 'rows', row, 'cols', col]);
    item = LIST_COLS_PAGES[pageIndex][col];
  }
  return { id, item, value };
};

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
  let numRows = reduction.getIn(['appState', 'pages', pageIndex, 'data', 'numRows']);
  const numCols = reduction.getIn(['appState', 'pages', pageIndex, 'data', 'numCols']);
  if (!numRows || !numCols || !editing) {
    return reduction;
  }

  let newReduction = reduction;

  const pageIsList = LIST_PAGES.indexOf(pageIndex) > -1;
  if (pageIsList) {
    numRows++; // include add row
  }

  let currentRow = editing.get('row');
  const currentCol = editing.get('col');
  if (pageIsList) {
    if (currentRow === -1 && currentCol === numCols - 1 && dx > 0) {
      // highlight add button
      return rActivateEditable(newReduction, null)
      .setIn(['appState', 'edit', 'addBtnFocus'], true);
    }
    currentRow++;
  }

  let row;
  let col;
  if (reduction.getIn(['appState', 'edit', 'addBtnFocus'])) {
    // navigate from the add button
    if (dx > 0) {
      row = 1;
      col = 0;
    }
    else {
      col = numCols - 1;
    }

    if (dy < 0) {
      row = numRows - 1;
    }
    newReduction = newReduction.setIn(['appState', 'edit', 'addBtnFocus'], false);
  }
  else if (currentCol === -1 && currentRow <= 0 && (dx < 0 || dy < 0)) {
    // go to the end if navigating backwards
    row = numRows - 1;
    col = numCols - 1;
  }
  else {
    row = (currentRow + dy +
              Math.floor((currentCol + dx) / numCols) + numRows) % numRows;
    col = (editing.get('col') + dx + numCols) % numCols;
  }
  if (pageIsList) {
    row--;
  }
  const itemValue = getItemValue(reduction, pageIndex, row, col);
  const id = itemValue.id;
  const item = itemValue.item;
  const value = itemValue.value;

  return rActivateEditable(newReduction, map({ row, col, pageIndex, id, item, value }));
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
    if (key.key === 'Enter') {
      // submit on enter
      return rActivateEditable(reduction, null);
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
 * @param {integer} pageIndex: page index to navigate to
 * @returns {Record} modified reduction
 */
export const rNavigateToPage = (reduction, pageIndex) => {
  Cookies.set('page', pageIndex, { expires: 7 });
  let newReduction = reduction;
  if (!newReduction.getIn(['appState', 'pagesLoaded', pageIndex])) {
    newReduction = rLoadContent(newReduction, pageIndex);
  }
  newReduction = newReduction.setIn(['appState', 'currentPageIndex'], pageIndex);
  if (LIST_PAGES.indexOf(pageIndex) > -1) {
    newReduction = newReduction.setIn(
      ['appState', 'edit', 'add'], getAddDefaultValues(pageIndex)
    ).setIn(
      ['appState', 'edit', 'active'], getNullEditable(pageIndex)
    ).setIn(['appState', 'edit', 'addBtnFocus'], false);
  }
  return newReduction;
};

export const rUpdateServer = reduction => {
  if (reduction.getIn(['appState', 'loadingApi'])) {
    // only make one request at once
    return reduction;
  }
  if (reduction.getIn(['appState', 'edit', 'queue']).size === 0 &
     reduction.getIn(['appState', 'edit', 'queueDelete']).size === 0) {
    // toggle the status to trigger another (delayed) update
    return reduction.setIn(
      ['appState', 'edit', 'status'],
      (reduction.getIn(['appState', 'edit', 'status']) + 1) & 1
    );
  }

  const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);
  const reqList = buildQueueRequestList(reduction);
  const req = { apiKey, list: reqList };

  return reduction.setIn(['appState', 'edit', 'status'], SERVER_UPDATE_REQUESTED)
  .setIn(['appState', 'loadingApi'], true)
  .set('effects', reduction.get('effects').push(buildMessage(EF_SERVER_UPDATE_REQUESTED, req)));
};

export const rHandleServerUpdate = (reduction, response) => {
  const status = response.data.error ? SERVER_UPDATE_ERROR : SERVER_UPDATE_RECEIVED;
  return reduction.setIn(['appState', 'loadingApi'], false)
  .setIn(['appState', 'edit', 'status'], status)
  .setIn(['appState', 'edit', 'queue'], list([]))
  .setIn(['appState', 'edit', 'queueDelete'], list([]));
};

