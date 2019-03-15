import { List as list, Map as map } from 'immutable';
import { resetAppState } from '../reduction';
import { rLoginFormReset, rLoginFormInput } from './login-form.reducer';
import { rActivateEditable } from './edit.reducer';
import { getNumRowsCols, getNavRowCol, getCurrentRowCol } from './nav';
import { makeGetRowIds, getAllPageRows } from '~client/selectors/list';
import { PAGES } from '~client/constants/data';

export const rOnWindowResize = (state, { size }) => state
    .setIn(['other', 'windowWidth'], size);

export function getItemValue(state, page, row, col) {
    let id = null;
    let item = null;
    let value = null;

    if (page === 'overview') {
        return { id, item, value: state.getIn(['pages', 'overview', 'data', 'cost', 'balance', row]) };
    }
    if (PAGES[page].list) {
        if (row > -1) {
            const rows = getAllPageRows(state, { page });

            id = row;
            value = rows.getIn([id, 'cols', col]);
            item = PAGES[page].cols[col];
        }
        else {
            value = state.getIn(['edit', 'add', page, col]);
            item = PAGES[page].cols[col];
        }

        return { id, item, value };
    }

    return { id: null, item: null, value: null };
}

function handleSuggestionsNav(state, direction, suggestions) {
    const newActive = ((suggestions.get('active') + 1 + direction) %
                     (suggestions.get('list').size + 1)) - 1;

    return state.setIn(['editSuggestions', 'active'], newActive);
}

const getRowKeys = makeGetRowIds();

function handleNav(state, { page, dx, dy, cancel }) {
    if (cancel) {
        return rActivateEditable(state, { page, cancel });
    }

    const pageIsList = Boolean(PAGES[page].list);
    const { numRows, numCols } = getNumRowsCols(state, page, pageIsList);
    const editing = state.getIn(['edit', 'active']);

    if (!(numRows && numCols && editing)) {
        return state;
    }

    const { currentRow, currentCol } = getCurrentRowCol(editing, pageIsList);

    const navigateToAddButton = currentRow === -1 && currentCol === numCols - 1 && dx > 0;

    if (pageIsList && navigateToAddButton) {
        return rActivateEditable(state, { page })
            .setIn(['edit', 'addBtnFocus'], true);
    }

    const addBtnFocus = state.getIn(['edit', 'addBtnFocus']);

    let navTo = null;
    if (pageIsList) {
        const rowKeys = getRowKeys(state, { page });

        navTo = getNavRowCol({
            dx, dy, rowKeys, numCols, currentRow, currentCol, addBtnFocus
        }, true);
    }
    else {
        navTo = getNavRowCol({ dx, dy, numRows, numCols, currentRow, currentCol });
    }

    const { row, col } = navTo;

    const itemValue = getItemValue(state, page, row, col);
    const id = itemValue.id;
    const item = itemValue.item;
    const value = itemValue.value;

    return rActivateEditable(state, { page, editable: map({ row, col, page, id, item, value }) });
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

function handleNavFromSuggestions(state, { page, suggestions, escape, enter }) {
    if (escape) {
        return state
            .setIn(['editSuggestions', 'list'], list.of())
            .setIn(['editSuggestions', 'active'], -1);
    }

    if (enter) {
        // navigate to the next field after filling the current one with
        // the suggestion value
        const handle = next => handleNav(next, { page, dx: 1, dy: 0 });

        const stateWithSuggestionValue = state.setIn(
            ['edit', 'active', 'value'],
            suggestions.getIn(['list', suggestions.get('active')]));

        const categoryCol = PAGES[page].cols.indexOf('category');

        if (suggestions.get('nextCategory').size &&
            state.getIn(['edit', 'active', 'row']) === -1 &&
            !state.getIn(['edit', 'add', page, categoryCol]).length
        ) {
            return handle(stateWithSuggestionValue.setIn(
                ['edit', 'add', page, categoryCol], suggestions.getIn(
                    ['nextCategory', suggestions.get('active')])
            ));
        }

        return handle(stateWithSuggestionValue);
    }

    return state;
}

function handleNavInSuggestions(state, { suggestions, dx, dy }) {
    if (dy === 0) {
        return handleSuggestionsNav(state, dx, suggestions);
    }

    return handleSuggestionsNav(state, dy, suggestions);
}

function handleKeyPressLoggedIn(state, { page, key, shift, ctrl, tab, escape, enter }) {
    const { dx, dy } = getNavDirection(key, shift);
    const navigated = !(dx === 0 && dy === 0);

    const suggestions = state.getIn(['editSuggestions']);
    const haveSuggestions = suggestions.get('list').size > 0;

    if (haveSuggestions) {
        const suggestionActive = suggestions.get('active') > -1;

        if (suggestionActive && (escape || enter)) {
            return handleNavFromSuggestions(state, { page, suggestions, escape, enter });
        }
        if (navigated && !ctrl) {
            return handleNavInSuggestions(state, { suggestions, dx, dy });
        }
    }

    if (enter) {
        if (state.getIn(['edit', 'addBtnFocus'])) {
            return state;
        }

        return rActivateEditable(state, { page });
    }
    if (navigated && (ctrl || tab)) {
        return handleNav(state, { page, dx, dy });
    }
    if (escape) {
        return handleNav(state, { page, cancel: true });
    }

    return state;
}

function handleKeyPressLoggedOut(state, { key, escape }) {
    if (escape) {
        return rLoginFormReset(state);
    }

    return rLoginFormInput(state, { input: key });
}

export function rHandleKeyPress(state, req) {
    const keyIsModifier = req.key === 'Control' || req.key === 'Shift';
    if (keyIsModifier) {
        return state;
    }

    const params = {
        ...req,
        escape: req.key === 'Escape',
        enter: req.key === 'Enter',
        tab: req.key === 'Tab',
        page: state.get('currentPage')
    };

    const loggedIn = state.getIn(['user', 'uid']) > 0;

    if (loggedIn) {
        return handleKeyPressLoggedIn(state, params);
    }

    return handleKeyPressLoggedOut(state, params);
}

export function rLogout(state) {
    if (state.getIn(['loading'])) {
        return state;
    }

    return resetAppState(state).setIn(['loginForm', 'visible'], true);
}

export const rUpdateTime = (state, { now }) => state.set('now', now);

export const rUpdateServer = state => state.set('loadingApi', true);

export const rHandleServerUpdate = state => state.set('loadingApi', false)
    .setIn(['edit', 'requestList'], list.of());

