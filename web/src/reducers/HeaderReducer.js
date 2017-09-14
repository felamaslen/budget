/*
 * Carries out actions for the Form component
 */

import { List as list, Map as map } from 'immutable';
import Cookies from 'js-cookie';
import buildMessage from '../messageBuilder';
import { resetAppState } from '../reduction';
import { rLoginFormSubmit, rLoginFormReset, rLoginFormInput } from './LoginFormReducer';
import { rLoadContent } from './ContentReducer';
import { rActivateEditable } from './EditReducer';
import { loadBlocks } from './data/list';
import { reloadAnalysis } from './data/analysis';
import { getFundsCachedValueAgeText } from './data/funds';
import { EF_SERVER_UPDATE_REQUESTED } from '../constants/effects';
import {
    PAGES, LIST_PAGES, LIST_COLS_PAGES,
    SERVER_UPDATE_REQUESTED, SERVER_UPDATE_ERROR, SERVER_UPDATE_RECEIVED
} from '../misc/const';
import { buildQueueRequestList, getNullEditable, getAddDefaultValues } from '../misc/data';

const pageIndexFunds = PAGES.indexOf('funds');

const getItemValue = (reduction, pageIndex, row, col) => {
    let id = null;
    let item = null;
    let value = null;
    if (PAGES[pageIndex] === 'overview') {
        value = reduction.getIn(['appState', 'pages', pageIndex, 'data', 'cost', 'balance', row]);
    }
    else if (LIST_PAGES.indexOf(pageIndex) > -1) {
        if (row > -1) {
            id = reduction.getIn(['appState', 'pages', pageIndex, 'rows', row, 'id']);
            value = reduction.getIn(['appState', 'pages', pageIndex, 'rows', row, 'cols', col]);
            item = LIST_COLS_PAGES[pageIndex][col];
        }
        else {
            value = reduction.getIn(['appState', 'edit', 'add', col]);
            item = LIST_COLS_PAGES[pageIndex][col];
        }
    }

    return { id, item, value };
};

/**
 * Handle suggestions navigation
 * @param {Record} reduction application state
 * @param {integer} direction direction
 * @param {map} suggestions suggestions object
 * @returns {Record} modified reduction
 */
const handleSuggestionsNav = (reduction, direction, suggestions) => {
    const newActive = ((suggestions.get('active') + 1 + direction) %
                     (suggestions.get('list').size + 1)) - 1;

    return reduction.setIn(['appState', 'edit', 'suggestions', 'active'], newActive);
};

/**
 * Handle navigation
 * @param {Record} reduction application state
 * @param {integer} dx x direction
 * @param {integer} dy y direction
 * @param {boolean} cancel clear any changes
 * @returns {Record} modified reduction
 */
const handleNav = (reduction, dx, dy, cancel) => {
    const editing = reduction.getIn(['appState', 'edit', 'active']);
    if (dx === null) {
        return rActivateEditable(reduction, null, cancel);
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
 * get x, y directions given a keypress (e.g. arrowRight -> [1, 0])
 * @param {string} key: event key
 * @param {boolean} shift: shift key was pressed
 * @returns {array} direction to navigate
 */
const getNavDirection = (key, shift) => {
    if (key === 'Tab') {
        return [shift ? -1 : 1, 0];
    }
    const arrows = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
    const arrowIndex = arrows.indexOf(key);
    if (arrowIndex > -1) {
        return [((arrowIndex % 4) - 1) % 2, (((arrowIndex - 1) % 4) - 1) % 2];
    }

    return [0, 0];
};

/**
 * Handle key presses
 * @param {Record} reduction application state
 * @param {object} evt key event
 * @returns {Record} modified reduction
 */
export const rHandleKeyPress = (reduction, evt) => {
    if (evt.key === 'Control' || evt.key === 'Shift') {
    // don't do anything until an actual key (not modifier) is pressed
        return reduction;
    }

    const direction = getNavDirection(evt.key, evt.shift);
    const navigated = direction[0] !== 0 || direction[1] !== 0;

    if (reduction.getIn(['appState', 'user', 'uid'])) {
    // logged in

    // handle suggestions navigation
        const suggestions = reduction.getIn(['appState', 'edit', 'suggestions']);
        if (suggestions.get('list').size > 0) {
            if (suggestions.get('active') > -1) {
                if (evt.key === 'Escape') {
                    return reduction
                        .setIn(['appState', 'edit', 'suggestions', 'list'], list.of())
                        .setIn(['appState', 'edit', 'suggestions', 'active'], -1);
                }
                if (evt.key === 'Enter') {
                    return handleNav(reduction.setIn(
                        ['appState', 'edit', 'active', 'value'],
                        suggestions.getIn(['list', suggestions.get('active')])
                    ), 1, 0);
                }
            }
            if (!evt.ctrl && (evt.key === 'Tab' || evt.key.indexOf('Arrow') > -1)) {
                return handleSuggestionsNav(
                    reduction, direction[1] === 0 ? direction[0] : direction[1], suggestions);
            }
        }
        // handle page navigation
        if (navigated && (evt.ctrl || evt.key === 'Tab')) {
            return handleNav(reduction, direction[0], direction[1]);
        }
        if (evt.key === 'Escape') {
            return handleNav(reduction, null, null, true);
        }
        if (evt.key === 'Enter') {
            // submit on enter
            return rActivateEditable(reduction, null);
        }

        return reduction;
    }
    // not logged in
    if (evt.key === 'Escape') {
        return rLoginFormReset(reduction, 0);
    }

    return rLoginFormInput(reduction, evt.key);
};

/**
 * Log out of the system
 * @param {Record} reduction application state
 * @returns {Record} modified reduction
 */
export const rLogout = reduction => {
    if (reduction.getIn(['appState', 'loading'])) {
        return reduction;
    }
    Cookies.remove('pin');

    return reduction.set('appState', resetAppState(reduction.get('appState')));
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
        const values = list(pin.split('')).map(item => parseInt(item, 10));
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
    if (PAGES[pageIndex] === 'analysis') {
        newReduction = reloadAnalysis(newReduction, newReduction);
    }

    return loadBlocks(newReduction, pageIndex);
};

export const rUpdateServer = reduction => {
    let newReduction = reduction;

    // update funds cached value age
    if (reduction.getIn(['appState', 'pages', pageIndexFunds])) {
        const ageText = getFundsCachedValueAgeText(
            reduction.getIn(['appState', 'other', 'graphFunds', 'startTime']),
            reduction.getIn(['appState', 'other', 'graphFunds', 'cacheTimes']),
            new Date()
        );

        newReduction = newReduction.setIn(['appState', 'other', 'fundsCachedValue', 'ageText'], ageText);
    }

    if (reduction.getIn(['appState', 'loadingApi'])) {
    // only make one request at once
        return newReduction;
    }
    if (reduction.getIn(['appState', 'edit', 'queue']).size === 0 &
     reduction.getIn(['appState', 'edit', 'queueDelete']).size === 0) {
    // toggle the status to trigger another (delayed) update
        return newReduction.setIn(
            ['appState', 'edit', 'status'],
            (reduction.getIn(['appState', 'edit', 'status']) + 1) & 1
        );
    }

    const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);
    const reqList = buildQueueRequestList(reduction);
    const req = { apiKey, list: reqList };

    return newReduction.setIn(['appState', 'edit', 'status'], SERVER_UPDATE_REQUESTED)
        .setIn(['appState', 'loadingApi'], true)
        .set('effects', reduction.get('effects').push(buildMessage(EF_SERVER_UPDATE_REQUESTED, req)));
};

export const rHandleServerUpdate = (reduction, response) => {
    const status = response.data.error ? SERVER_UPDATE_ERROR : SERVER_UPDATE_RECEIVED;
    const newReduction = reduction.setIn(['appState', 'loadingApi'], false)
        .setIn(['appState', 'edit', 'status'], status)
        .setIn(['appState', 'edit', 'queue'], list.of())
        .setIn(['appState', 'edit', 'queueDelete'], list.of());

    return loadBlocks(newReduction, newReduction.getIn(['appState', 'currentPageIndex']), true);
};

