/*
 * Carries out actions for the Form component
 */

import { List as list, Map as map } from 'immutable';
import buildMessage from '../messageBuilder';
import { resetAppState } from '../reduction';
import { rLoginFormReset, rLoginFormInput } from './LoginFormReducer';
import { rLoadContent } from './ContentReducer';
import { rActivateEditable } from './EditReducer';
import { reloadAnalysis } from './data/analysis';
import { getFundsCachedValueAgeText } from './data/funds';
import {
    EF_SERVER_UPDATE_REQUESTED,
} from '../constants/effects';
import {
    PAGES, LIST_PAGES, LIST_COLS_PAGES,
    SERVER_UPDATE_REQUESTED, SERVER_UPDATE_ERROR, SERVER_UPDATE_RECEIVED
} from '../misc/const';
import { getNullEditable, getAddDefaultValues } from '../misc/data';

const pageIndexFunds = PAGES.indexOf('funds');

function getItemValue(reduction, pageIndex, row, col) {
    let id = null;
    let item = null;
    let value = null;
    if (PAGES[pageIndex] === 'overview') {
        value = reduction.getIn(['pages', pageIndex, 'data', 'cost', 'balance', row]);
    }
    else if (LIST_PAGES.indexOf(pageIndex) > -1) {
        if (row > -1) {
            id = reduction.getIn(['pages', pageIndex, 'rows', row, 'id']);
            value = reduction.getIn(['pages', pageIndex, 'rows', row, 'cols', col]);
            item = LIST_COLS_PAGES[pageIndex][col];
        }
        else {
            value = reduction.getIn(['edit', 'add', col]);
            item = LIST_COLS_PAGES[pageIndex][col];
        }
    }

    return { id, item, value };
}

/**
 * Handle suggestions navigation
 * @param {Record} reduction application state
 * @param {integer} direction direction
 * @param {map} suggestions suggestions object
 * @returns {Record} modified reduction
 */
function handleSuggestionsNav(reduction, direction, suggestions) {
    const newActive = ((suggestions.get('active') + 1 + direction) %
                     (suggestions.get('list').size + 1)) - 1;

    return reduction.setIn(['edit', 'suggestions', 'active'], newActive);
}

export function getNavRow(
    dx, dy, numRows, numCols, currentRow, currentCol, editing, addBtnFocus, pageIsList
) {
    const listOffset = pageIsList
        ? -1
        : 0;

    if (addBtnFocus) {
        // navigate from the add button
        if (dy < 0) {
            return numRows + listOffset - 1;
        }

        if (dx > 0) {
            return listOffset + 1;
        }
    }

    if (currentCol === -1 && currentRow <= 0 && (dx < 0 || dy < 0)) {
        // go to the end if navigating backwards
        return numRows + listOffset - 1;
    }

    return listOffset + ((currentRow + dy + Math.floor(
        (currentCol + dx) / numCols
    ) + numRows) % numRows);
}

export function getNavCol(
    dx, dy, numRows, numCols, currentRow, currentCol, editing, addBtnFocus
) {
    if (addBtnFocus) {
        // navigate from the add button
        if (dx > 0) {
            return 0;
        }

        return numCols - 1;
    }

    if (currentCol === -1 && currentRow <= 0 && (dx < 0 || dy < 0)) {
        // go to the end if navigating backwards
        return numCols - 1;
    }

    return (editing.get('col') + dx + numCols) % numCols;
}

export function getNavRowCol(
    dx, dy, numRows, numCols, currentRow, currentCol, editing, addBtnFocus, pageIsList
) {
    const row = getNavRow(
        dx, dy, numRows, numCols, currentRow, currentCol, editing, addBtnFocus, pageIsList
    );

    const col = getNavCol(
        dx, dy, numRows, numCols, currentRow, currentCol, editing, addBtnFocus
    );

    return { row, col };
}

function getNumRowsCols(reduction, pageIndex, pageIsList) {
    let numRows = reduction.getIn(['pages', pageIndex, 'data', 'numRows']);
    const numCols = reduction.getIn(['pages', pageIndex, 'data', 'numCols']);

    if (pageIsList) {
        // include add row
        numRows += 1;
    }

    return { numRows, numCols };
}

function getCurrentRowCol(editing, pageIsList) {
    let currentRow = editing.get('row');
    const currentCol = editing.get('col');

    if (pageIsList) {
        // include add row
        currentRow += 1;
    }

    return { currentRow, currentCol };
}

/**
 * Handle navigation
 * @param {Record} reduction application state
 * @param {integer} dx x direction
 * @param {integer} dy y direction
 * @param {boolean} cancel clear any changes
 * @returns {Record} modified reduction
 */
function handleNav(reduction, dx, dy, cancel) {
    if (dx === null) {
        return rActivateEditable(reduction, null, cancel);
    }

    const pageIndex = reduction.getIn(['currentPageIndex']);
    const pageIsList = LIST_PAGES.indexOf(pageIndex) > -1;
    const { numRows, numCols } = getNumRowsCols(reduction, pageIndex, pageIsList);
    const editing = reduction.getIn(['edit', 'active']);

    if (!numRows || !numCols || !editing) {
        return reduction;
    }

    const { currentRow, currentCol } = getCurrentRowCol(editing, pageIsList);

    if (pageIsList && currentRow === 0 && currentCol === numCols - 1 && dx > 0) {
        // highlight add button
        return rActivateEditable(reduction, null)
            .setIn(['edit', 'addBtnFocus'], true);
    }

    const addBtnFocus = reduction.getIn(['edit', 'addBtnFocus']);
    const { row, col } = getNavRowCol(
        dx, dy, numRows, numCols, currentRow, currentCol, editing, addBtnFocus, pageIsList
    );

    const itemValue = getItemValue(reduction, pageIndex, row, col);
    const id = itemValue.id;
    const item = itemValue.item;
    const value = itemValue.value;

    return rActivateEditable(
        reduction, map({ row, col, pageIndex, id, item, value })
    );
}

/**
 * get x, y directions given a keypress (e.g. arrowRight -> [1, 0])
 * @param {string} key: event key
 * @param {boolean} shift: shift key was pressed
 * @returns {array} direction to navigate
 */
function getNavDirection(key, shift) {
    if (key === 'Tab') {
        const dx = shift
            ? -1
            : 1;

        const dy = 0;

        return [dx, dy];
    }

    const arrows = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
    const arrowIndex = arrows.indexOf(key);
    if (arrowIndex > -1) {
        return [
            ((arrowIndex % 4) - 1) % 2,
            (((arrowIndex - 1) % 4) - 1) % 2
        ];
    }

    return [0, 0];
}

function handleNavFromSuggestions(reduction, suggestions, escape, enter) {
    if (escape) {
        return reduction
            .setIn(['edit', 'suggestions', 'list'], list.of())
            .setIn(['edit', 'suggestions', 'active'], -1);
    }

    if (enter) {
        const reductionWithSuggestionValue = reduction
            .setIn(
                ['edit', 'active', 'value'],
                suggestions.getIn(['list', suggestions.get('active')])
            );

        // navigate to the next field after filling the current one with
        // the suggestion value
        return handleNav(reductionWithSuggestionValue, 1, 0);
    }

    return reduction;
}

function handleNavInSuggestions(reduction, suggestions, direction) {
    if (direction[1] === 0) {
        return handleSuggestionsNav(reduction, direction[0], suggestions);
    }

    return handleSuggestionsNav(reduction, direction[1], suggestions);
}

function handleKeyPressLoggedIn(reduction, evt) {
    const direction = getNavDirection(evt.key, evt.shift);
    const navigated = direction[0] !== 0 || direction[1] !== 0;

    const escape = evt.key === 'Escape';
    const enter = evt.key === 'Enter';

    const suggestions = reduction.getIn(['edit', 'suggestions']);
    const haveSuggestions = suggestions.get('list').size > 0;
    const suggestionActive = suggestions.get('active') > -1;

    const navigateFromSuggestions = suggestionActive && (escape || enter);
    const navigateSuggestions = navigated && !evt.ctrl;

    if (haveSuggestions && navigateFromSuggestions) {
        return handleNavFromSuggestions(reduction, suggestions, escape, enter);
    }

    if (haveSuggestions && navigateSuggestions) {
        return handleNavInSuggestions(reduction, suggestions, direction);
    }

    const navigateFromField = navigated && (evt.ctrl || evt.key === 'Tab');

    if (navigateFromField) {
        return handleNav(reduction, direction[0], direction[1]);
    }

    if (escape) {
        return handleNav(reduction, null, null, true);
    }

    if (enter) {
        return rActivateEditable(reduction, null);
    }

    return reduction;
}

export function rHandleKeyPress(reduction, evt) {
    const keyIsModifier = evt.key === 'Control' || evt.key === 'Shift';
    if (keyIsModifier) {
        return reduction;
    }

    const loggedIn = reduction.getIn(['user', 'uid']) > 0;

    if (loggedIn) {
        return handleKeyPressLoggedIn(reduction, evt);
    }

    if (evt.key === 'Escape') {
        return rLoginFormReset(reduction, 0);
    }

    return rLoginFormInput(reduction, evt.key);
}

/**
 * Log out of the system
 * @param {Record} reduction application state
 * @returns {Record} modified reduction
 */
export const rLogout = reduction => {
    if (reduction.getIn(['loading'])) {
        return reduction;
    }

    return resetAppState(reduction)
        .setIn(['loginForm', 'visible'], true);
};

/**
 * Navigate to a page (index)
 * @param {Record} reduction application state
 * @param {integer} pageIndex: page index to navigate to
 * @returns {Record} modified reduction
 */
export function rNavigateToPage(reduction, pageIndex) {
    let newReduction = reduction;
    if (!newReduction.getIn(['pagesLoaded', pageIndex])) {
        newReduction = rLoadContent(newReduction, pageIndex);
    }
    newReduction = newReduction.setIn(['currentPageIndex'], pageIndex);
    if (LIST_PAGES.indexOf(pageIndex) > -1) {
        newReduction = newReduction
            .setIn(
                ['edit', 'add'], getAddDefaultValues(pageIndex)
            )
            .setIn(
                ['edit', 'active'], getNullEditable(pageIndex)
            )
            .setIn(['edit', 'addBtnFocus'], false);
    }

    if (PAGES[pageIndex] === 'analysis') {
        newReduction = reloadAnalysis(newReduction, newReduction);
    }

    return newReduction;
}

export function rUpdateServer(reduction) {
    return reduction.set('loadingApi', true);
}

export function rUpdateTime(reduction) {
    if (reduction.getIn(['pages', pageIndexFunds])) {
        const ageText = getFundsCachedValueAgeText(
            reduction.getIn(['other', 'graphFunds', 'startTime']),
            reduction.getIn(['other', 'graphFunds', 'cacheTimes']),
            new Date()
        );

        return reduction.setIn(
            ['other', 'fundsCachedValue', 'ageText'], ageText
        );
    }

    return reduction;
}

export function rHandleServerUpdate(reduction) {
    return reduction
        .set('loadingApi', false)
        .setIn(['edit', 'requestList'], list.of());
}

