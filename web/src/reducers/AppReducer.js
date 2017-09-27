/*
 * Carries out actions for the Form component
 */

import { List as list, Map as map } from 'immutable';

import { resetAppState } from '../reduction';
import { rLoginFormReset, rLoginFormInput } from './LoginFormReducer';
import { rLoadContent } from './ContentReducer';
import { rActivateEditable } from './EditReducer';
import { reloadAnalysis } from './data/analysis';
import { getFundsCachedValueAgeText } from './data/funds';
import { PAGES, LIST_PAGES, LIST_COLS_PAGES } from '../misc/const';
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

function handleSuggestionsNav(reduction, direction, suggestions) {
    const newActive = ((suggestions.get('active') + 1 + direction) %
                     (suggestions.get('list').size + 1)) - 1;

    return reduction.setIn(['editSuggestions', 'active'], newActive);
}

export function getNavRow({
    dx, dy, numRows, numCols, currentRow, currentCol, addBtnFocus, pageIsList
}) {
    if (pageIsList && addBtnFocus) {
        // navigate from the add button
        if (dy < 0) {
            return numRows - 2;
        }

        if (dx > 0) {
            return 0;
        }
    }

    if (currentCol === -1 && currentRow === 0 && (dx < 0 || dy < 0)) {
        // go to the end if navigating backwards
        if (pageIsList) {
            return numRows - 2;
        }

        return numRows - 1;
    }

    const rowsJumped = Math.floor((currentCol + dx) / numCols);

    const newRow = (currentRow + dy + rowsJumped + numRows) % numRows

    if (pageIsList) {
        return newRow - 1;
    }

    return newRow;
}

export function getNavCol({
    dx, dy, numCols, currentRow, currentCol, addBtnFocus
}) {
    if (addBtnFocus) {
        // navigate from the add button
        if (dx > 0) {
            return 0;
        }

        return numCols - 1;
    }

    if (currentCol === -1 && currentRow === 0 && (dx < 0 || dy < 0)) {
        // go to the end if navigating backwards
        return numCols - 1;
    }

    return (currentCol + dx + numCols) % numCols;
}

export function getNavRowCol({
    dx, dy, numRows, numCols, currentRow, currentCol, addBtnFocus, pageIsList
}) {
    const row = getNavRow({
        dx, dy, numRows, numCols, currentRow, currentCol, addBtnFocus, pageIsList
    });

    const col = getNavCol({
        dx, dy, numCols, currentRow, currentCol, addBtnFocus
    });

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

export function getCurrentRowCol(editing, pageIsList = false) {
    let currentRow = editing.get('row');
    const currentCol = editing.get('col');

    if (pageIsList) {
        // include add row
        currentRow += 1;
    }

    return { currentRow, currentCol };
}

function handleNav(reduction, direction, cancel) {
    if (!direction) {
        return rActivateEditable(reduction, null, cancel);
    }

    const { dx, dy } = direction;

    const pageIndex = reduction.getIn(['currentPageIndex']);
    const pageIsList = LIST_PAGES.indexOf(pageIndex) > -1;
    const { numRows, numCols } = getNumRowsCols(reduction, pageIndex, pageIsList);
    const editing = reduction.getIn(['edit', 'active']);

    if (!numRows || !numCols || !editing) {
        return reduction;
    }

    const { currentRow, currentCol } = getCurrentRowCol(editing, pageIsList);

    const navigateToAddButton = currentRow === 0 && currentCol === numCols - 1 && dx > 0;

    if (pageIsList && navigateToAddButton) {
        return rActivateEditable(reduction, null)
            .setIn(['edit', 'addBtnFocus'], true);
    }

    const addBtnFocus = reduction.getIn(['edit', 'addBtnFocus']);
    const { row, col } = getNavRowCol({
        dx, dy, numRows, numCols, currentRow, currentCol, addBtnFocus, pageIsList
    });

    const itemValue = getItemValue(reduction, pageIndex, row, col);
    const id = itemValue.id;
    const item = itemValue.item;
    const value = itemValue.value;

    return rActivateEditable(
        reduction, map({ row, col, pageIndex, id, item, value })
    );
}

function getNavDirection(key, shift) {
    if (key === 'Tab') {
        if (shift) {
            return { dx: -1, dy: 0 };
        }

        return { dx: 1, dy: 0 };
    }

    const arrows = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
    const arrowIndex = arrows.indexOf(key);
    if (arrowIndex > -1) {
        return {
            dx: ((arrowIndex % 4) - 1) % 2,
            dy: (((arrowIndex - 1) % 4) - 1) % 2
        };
    }

    return { dx: 0, dy: 0 };
}

function handleNavFromSuggestions(reduction, suggestions, escape, enter) {
    if (escape) {
        return reduction
            .setIn(['editSuggestions', 'list'], list.of())
            .setIn(['editSuggestions', 'active'], -1);
    }

    if (enter) {
        const reductionWithSuggestionValue = reduction
            .setIn(
                ['edit', 'active', 'value'],
                suggestions.getIn(['list', suggestions.get('active')])
            );

        // navigate to the next field after filling the current one with
        // the suggestion value
        return handleNav(reductionWithSuggestionValue, { dx: 1, dy: 0 });
    }

    return reduction;
}

function handleNavInSuggestions(reduction, suggestions, { dx, dy }) {
    if (dy === 0) {
        return handleSuggestionsNav(reduction, dx, suggestions);
    }

    return handleSuggestionsNav(reduction, dy, suggestions);
}

function handleKeyPressLoggedIn(reduction, evt) {
    const { dx, dy } = getNavDirection(evt.key, evt.shift);
    const navigated = dx !== 0 || dy !== 0;

    const escape = evt.key === 'Escape';
    const enter = evt.key === 'Enter';

    const suggestions = reduction.getIn(['editSuggestions']);
    const haveSuggestions = suggestions.get('list').size > 0;
    const suggestionActive = suggestions.get('active') > -1;

    const navigateFromSuggestions = suggestionActive && (escape || enter);
    const navigateSuggestions = navigated && !evt.ctrl;

    if (haveSuggestions && navigateFromSuggestions) {
        return handleNavFromSuggestions(reduction, suggestions, escape, enter);
    }

    if (haveSuggestions && navigateSuggestions) {
        return handleNavInSuggestions(reduction, suggestions, { dx, dy });
    }

    const navigateFromField = navigated && (evt.ctrl || evt.key === 'Tab');

    if (navigateFromField) {
        return handleNav(reduction, { dx, dy });
    }

    if (escape) {
        return handleNav(reduction, null, true);
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

export function rLogout(reduction) {
    if (reduction.getIn(['loading'])) {
        return reduction;
    }

    return resetAppState(reduction)
        .setIn(['loginForm', 'visible'], true);
}

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

export function rUpdateServer(reduction) {
    return reduction.set('loadingApi', true);
}

export function rHandleServerUpdate(reduction) {
    return reduction.set('loadingApi', false);
}

