import { useReducer, useCallback, useEffect } from 'react';

import {
    CANCELLED, isEscape, isEnter, isCtrl, getNavDirection,
} from '~client/modules/nav';
import { CREATE_ID, PAGES, PAGES_LIST } from '~client/constants/data';

export const ADD_BTN = 'ADD_BTN';

export const ITEMS_SET = 'ITEMS_SET';
export const COLUMNS_SET = 'COLUMNS_SET';
export const NAV_TOGGLED = 'NAV_TOGGLED';
export const NAV_NEXT = 'NAV_NEXT';
export const NAV_PREV = 'NAV_PREV';
export const NAV_XY = 'NAV_XY';
export const ACTIVE_SET = 'ACTIVE_SET';
const COMMAND_SET = 'COMMAND_SET';

export const NULL_COMMAND = {};

function navNext(state) {
    if (state.activeId === null || !state.items.length) {
        return { ...state, activeId: CREATE_ID };
    }
    if (state.activeId === CREATE_ID) {
        return { ...state, activeId: state.items[0].id };
    }

    const index = state.items.findIndex(({ id }) => id === state.activeId);
    if (index === -1 || index >= state.items.length - 1) {
        return { ...state, activeId: CREATE_ID };
    }

    return { ...state, activeId: state.items[index + 1].id };
}

function navPrev(state) {
    if (!state.items.length) {
        return { ...state, activeId: CREATE_ID };
    }
    if (state.activeId === CREATE_ID || state.activeId === null) {
        return { ...state, activeId: state.items[state.items.length - 1].id };
    }

    const index = state.items.findIndex(({ id }) => id === state.activeId);
    if (index < 1) {
        return { ...state, activeId: CREATE_ID };
    }

    return { ...state, activeId: state.items[index - 1].id };
}

function getNextActiveColumn(state, dx, dy) {
    if (dy !== 0) {
        if (state.activeColumn === ADD_BTN) {
            return state.columns[state.columns.length - 1];
        }
        if (!state.activeColumn) {
            return state.columns[0];
        }

        return state.activeColumn;
    }

    return state.activeColumn;
}

function navXYHelper(state, dx, dy) {
    const rowIndex = state.items.findIndex(({ id }) => id === state.activeId);
    const columnIndex = state.columns.indexOf(state.activeColumn);
    if (dx > 0) {
        if (!state.activeId) {
            return { activeId: CREATE_ID, activeColumn: state.columns[0] };
        }
        if (state.activeId === CREATE_ID) {
            if (state.activeColumn === ADD_BTN) {
                return { ...navNext(state), activeColumn: state.columns[0] };
            }
            if (columnIndex < state.columns.length - 1) {
                return { activeColumn: state.columns[columnIndex + 1] };
            }

            return { activeColumn: ADD_BTN };
        }

        if (columnIndex < state.columns.length - 1) {
            return { activeColumn: state.columns[columnIndex + 1] };
        }

        return { ...navNext(state), activeColumn: state.columns[0] };
    }
    if (dx < 0) {
        if (!state.activeId) {
            return { ...navPrev(state), activeColumn: state.columns[state.columns.length - 1] };
        }
        if (state.activeId === CREATE_ID) {
            if (state.activeColumn === ADD_BTN) {
                return { activeColumn: state.columns[state.columns.length - 1] };
            }
            if (columnIndex > 0) {
                return { activeColumn: state.columns[columnIndex - 1] };
            }

            return { ...navPrev(state), activeColumn: state.columns[state.columns.length - 1] };
        }

        if (columnIndex > 0) {
            return { activeColumn: state.columns[columnIndex - 1] };
        }

        if (rowIndex === 0) {
            return { ...navPrev(state), activeColumn: ADD_BTN };
        }

        return { ...navPrev(state), activeColumn: state.columns[state.columns.length - 1] };
    }
    if (dy > 0) {
        const activeColumn = getNextActiveColumn(state, dx, dy);

        return { ...navNext(state), activeColumn };
    }
    if (dy < 0) {
        const activeColumn = getNextActiveColumn(state, dx, dy);

        return { ...navPrev(state), activeColumn };
    }

    return {};
}

function navXY(state, { dx = 0, dy = 0 }) {
    if (!(state.columns && state.columns.length)) {
        if (dx > 0 || dy > 0) {
            return navNext(state);
        }

        return navPrev(state);
    }

    return { ...state, ...navXYHelper(state, dx, dy) };
}

function navReducerHelper(state, action) {
    if (action.type === COMMAND_SET) {
        return {
            ...state,
            command: {
                type: action.command,
                id: action.id || state.activeId,
                column: action.column || state.activeColumn,
                payload: action.payload,
            },
            activeId: action.activeId || state.activeId,
            activeColumn: action.activeColumn || state.activeColumn,
        };
    }
    if (action.type === ITEMS_SET) {
        return { ...state, items: action.items };
    }
    if (action.type === COLUMNS_SET) {
        return { ...state, columns: action.columns };
    }
    if (action.type === NAV_TOGGLED) {
        return { ...state, nav: !state.nav, activeId: null };
    }
    if (action.type === ACTIVE_SET) {
        return { ...state, activeId: action.id, activeColumn: action.column || null };
    }
    if (!state.nav) {
        return state;
    }
    if (action.type === NAV_NEXT) {
        return navNext(state);
    }
    if (action.type === NAV_PREV) {
        return navPrev(state);
    }
    if (action.type === NAV_XY) {
        return navXY(state, action);
    }

    return state;
}

export function navReducer(state, action) {
    const nextState = navReducerHelper(state, action);

    if (!(nextState.activeId === state.activeId && nextState.items === state.items)) {
        return {
            ...nextState,
            activeItem: nextState.activeId && nextState.activeId !== CREATE_ID
                ? nextState.items.find(({ id }) => id === nextState.activeId)
                : null,
        };
    }

    return nextState;
}

const NULL_COLUMNS = [];
function getColumns(page) {
    if (!(page && PAGES_LIST.includes(page))) {
        return NULL_COLUMNS;
    }

    return PAGES[page].cols;
}

export function useNav(nav, items, page = null) {
    const [state, dispatch] = useReducer(navReducer, {
        nav: false,
        command: NULL_COMMAND,
        items,
        columns: getColumns(page),
        activeId: null,
        activeItem: null,
        activeColumn: null,
    });

    useEffect(() => {
        dispatch({ type: ITEMS_SET, items });
    }, [items]);

    useEffect(() => {
        dispatch({ type: COLUMNS_SET, columns: getColumns(page) });
    }, [page]);

    useEffect(() => {
        if (nav !== state.nav) {
            dispatch({ type: NAV_TOGGLED, items });
        }
    }, [nav, items, state.nav]);

    const setActive = useCallback((id, column) => dispatch({ type: ACTIVE_SET, id, column }), []);

    const onNext = useCallback(() => dispatch({ type: NAV_NEXT }), []);
    const onPrev = useCallback(() => dispatch({ type: NAV_PREV }), []);

    const setCommand = useCallback((action) => {
        if (typeof action === 'string') {
            dispatch({ type: COMMAND_SET, command: action });
        } else {
            dispatch({ type: COMMAND_SET, ...action });
        }
    }, []);

    const onKey = useCallback((event) => {
        if (isEscape(event)) {
            event.preventDefault();
            dispatch({ type: COMMAND_SET, command: CANCELLED });

            return setImmediate(() => dispatch({ type: ACTIVE_SET, id: null, column: null }));
        }
        if (isEnter(event) && isCtrl(event)) {
            return dispatch({ type: ACTIVE_SET, id: null, column: null });
        }

        const { dx, dy } = getNavDirection(event, true);
        if (!(dx === 0 && dy === 0)) {
            return dispatch({ type: NAV_XY, dx, dy });
        }

        return null;
    }, []);

    useEffect(() => {
        if (!state.nav && nav) {
            window.addEventListener('keydown', onKey);
        } else if (!nav && state.nav) {
            window.removeEventListener('keydown', onKey);
        }
    }, [nav, state.nav, onKey]);

    useEffect(() => () => {
        window.removeEventListener('keydown', onKey);
    }, [onKey]);

    return [state, setActive, setCommand, onNext, onPrev];
}
