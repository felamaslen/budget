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
            value = reduction.getIn(['edit', 'add', pageIndex, col]);
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

export function getNavRow({ dx, dy, numRows, numCols, currentRow, currentCol }) {
    const wasInactive = currentCol === -1 && currentRow === 0;
    if (wasInactive) {
        if (dx < 0 || dy < 0) {
            return numRows - 1;
        }

        return 0;
    }

    const backwardsFromTop = currentCol === 0 && currentRow === 0 && (dx < 0 || dy < 0);
    if (backwardsFromTop) {
        return numRows - 1;
    }

    const rowsJumped = Math.floor((currentCol + dx) / numCols);

    const newRow = (currentRow + dy + rowsJumped + numRows) % numRows

    return newRow;
}

export function getNavRowFromAddButton(dx, dy, rowKeys) {
    if (dy < 0) {
        return rowKeys.last();
    }

    if (dx < 0) {
        return -1;
    }

    return rowKeys.first();
}

export function getNavRowList({ dx, dy, rowKeys, numCols, currentRow, currentCol, addBtnFocus }) {
    if (addBtnFocus) {
        return getNavRowFromAddButton(dx, dy, rowKeys);
    }

    const wasInactive = currentRow === -1 && currentCol === -1;
    if (wasInactive) {
        if (dx < 0 || dy < 0) {
            return rowKeys.last();
        }

        return -1;
    }

    const backwardsFromTop = currentCol === 0 && currentRow === 0 && (dx < 0 || dy < 0)
    if (backwardsFromTop) {
        return rowKeys.last();
    }

    const rowsJumped = dy + Math.floor((currentCol + dx) / numCols);
    const currentRowKey = rowKeys.indexOf(currentRow);

    const currentlyAtTop = currentRowKey === -1;
    if (currentlyAtTop) {
        if (rowsJumped > 0) {
            return rowKeys.get(rowsJumped - 1);
        }

        if (rowsJumped < 0) {
            return rowKeys.get(rowKeys.size + rowsJumped);
        }

        return -1;
    }

    const newRowKey = currentRowKey + rowsJumped;
    if (newRowKey < 0 || newRowKey > rowKeys.size - 1) {
        return -1;
    }

    return rowKeys.get(currentRowKey + rowsJumped);
}

export function getNavCol({ dx, dy, numCols, currentRow, currentCol, addBtnFocus }) {
    if (addBtnFocus) {
        // navigate from the add button
        if (dx > 0) {
            return 0;
        }

        return numCols - 1;
    }

    const wasInactive = currentRow === -1 && currentCol === -1;
    if (wasInactive) {
        if (dx < 0 || dy < 0) {
            return numCols - 1;
        }

        return 0;
    }

    const backwardsFromTop = currentCol === 0 && currentRow === 0 && (dx < 0 || dy < 0);
    if (backwardsFromTop) {
        // go to the end if navigating backwards
        return numCols - 1;
    }

    return (currentCol + dx + numCols) % numCols;
}

export function getNavRowCol(req, pageIsList = false) {
    const row = pageIsList
        ? getNavRowList(req)
        : getNavRow(req);

    const col = getNavCol(req);

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

export function getCurrentRowCol(editing) {
    const currentRow = editing.get('row');
    const currentCol = editing.get('col');

    return { currentRow, currentCol };
}

function handleNav(reduction, { pageIndex, dx, dy, cancel }) {
    if (cancel) {
        return rActivateEditable(reduction, { pageIndex, cancel });
    }

    const pageIsList = LIST_PAGES.indexOf(pageIndex) > -1;
    const { numRows, numCols } = getNumRowsCols(reduction, pageIndex, pageIsList);
    const editing = reduction.getIn(['edit', 'active']);

    if (!numRows || !numCols || !editing) {
        return reduction;
    }

    const { currentRow, currentCol } = getCurrentRowCol(editing, pageIsList);

    const navigateToAddButton = currentRow === -1 && currentCol === numCols - 1 && dx > 0;

    if (pageIsList && navigateToAddButton) {
        return rActivateEditable(reduction, { pageIndex })
            .setIn(['edit', 'addBtnFocus'], true);
    }

    const addBtnFocus = reduction.getIn(['edit', 'addBtnFocus']);

    let navTo = null;
    if (pageIsList) {
        const rowKeys = reduction
            .getIn(['pages', pageIndex, 'rows'])
            .keySeq()
            .toList();

        navTo = getNavRowCol({
            dx, dy, rowKeys, numCols, currentRow, currentCol, addBtnFocus
        }, true);
    }
    else {
        navTo = getNavRowCol({ dx, dy, numRows, numCols, currentRow, currentCol });
    }

    const { row, col } = navTo;

    const itemValue = getItemValue(reduction, pageIndex, row, col);
    const id = itemValue.id;
    const item = itemValue.item;
    const value = itemValue.value;

    return rActivateEditable(
        reduction, { pageIndex, editable: map({ row, col, pageIndex, id, item, value }) }
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

function handleNavFromSuggestions(reduction, { pageIndex, suggestions, escape, enter }) {
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
        return handleNav(reductionWithSuggestionValue, { pageIndex, dx: 1, dy: 0 });
    }

    return reduction;
}

function handleNavInSuggestions(reduction, { suggestions, dx, dy }) {
    if (dy === 0) {
        return handleSuggestionsNav(reduction, dx, suggestions);
    }

    return handleSuggestionsNav(reduction, dy, suggestions);
}

function handleKeyPressLoggedIn(reduction, { pageIndex, key, shift, ctrl }) {
    const { dx, dy } = getNavDirection(key, shift);
    const navigated = dx !== 0 || dy !== 0;

    const escape = key === 'Escape';
    const enter = key === 'Enter';

    const suggestions = reduction.getIn(['editSuggestions']);
    const haveSuggestions = suggestions.get('list').size > 0;
    const suggestionActive = suggestions.get('active') > -1;

    const navigateFromSuggestions = suggestionActive && (escape || enter);
    const navigateSuggestions = navigated && !ctrl;

    if (haveSuggestions && navigateFromSuggestions) {
        return handleNavFromSuggestions(reduction, { pageIndex, suggestions, escape, enter });
    }

    if (haveSuggestions && navigateSuggestions) {
        return handleNavInSuggestions(reduction, { suggestions, dx, dy });
    }

    const addBtn = reduction.getIn(['edit', 'addBtnFocus']);
    if (addBtn && enter) {
        // this is handled by the button
        return reduction;
    }

    const navigateFromField = navigated && (ctrl || key === 'Tab');

    if (navigateFromField) {
        return handleNav(reduction, { pageIndex, dx, dy });
    }

    if (escape) {
        return handleNav(reduction, { pageIndex, cancel: true });
    }

    if (enter) {
        return rActivateEditable(reduction, { pageIndex });
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
                ['edit', 'add', pageIndex], getAddDefaultValues(pageIndex)
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
    return reduction
        .set('loadingApi', false)
        .setIn(['edit', 'requestList'], list.of());
}

