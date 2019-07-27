import { connect } from 'react-redux';
import React, { useReducer, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'throttle-debounce';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import shortid from 'shortid';

import { suggestionsRequested, suggestionsCleared } from '~client/actions/suggestions';
import { isCtrl, isEnter, getNavDirection } from '~client/modules/nav';

const NAV_PREV = 'NAV_PREV';
const NAV_NEXT = 'NAV_NEXT';
const LIST_SIZE_SET = 'LIST_SIZE_SET';
const CONFIRMED = 'CONFIRMED';

function suggestionsReducer(state, action) {
    if (action.type === LIST_SIZE_SET) {
        if (!action.size) {
            return { ...state, size: 0, active: null };
        }
        if (action.size < state.active) {
            return { ...state, size: action.size, active: 0 };
        }

        return { ...state, size: action.size };
    }
    if (!state.size) {
        return state;
    }
    if (action.type === NAV_PREV) {
        return { ...state, active: ((state.active - 1 + state.size) % state.size) % state.size };
    }
    if (action.type === NAV_NEXT) {
        if (state.active === null) {
            return { ...state, active: 0 };
        }

        return { ...state, active: (state.active + 1) % state.size };
    }
    if (action.type === CONFIRMED) {
        if (state.active === null || state.active >= state.size) {
            return { ...state, confirm: null };
        }

        return { ...state, confirm: shortid.generate(), prevConfirm: state.confirm };
    }

    return state;
}

function SuggestionsList({ page, column, search, onConfirm, list, next, request, clear }) {
    const [state, dispatch] = useReducer(suggestionsReducer, { size: list.length, active: null });
    useEffect(() => {
        dispatch({ type: LIST_SIZE_SET, size: list.length });
    }, [list.length, next]);

    const requestDebounced = useMemo(() => debounce(100, request), [request]);

    useEffect(() => {
        if (search.length) {
            requestDebounced(page, column, search);
        } else {
            clear();
        }
    }, [requestDebounced, clear, page, column, search]);

    useEffect(() => clear, [clear]);

    const { size, active } = state;
    const haveList = size > 0;

    useEffect(() => {
        if (state.confirm &&
            state.confirm !== state.prevConfirm &&
            haveList &&
            state.active !== null
        ) {
            const nextValue = state.active < next.length
                ? next[state.active]
                : null;

            onConfirm(list[state.active], nextValue);
        }
    }, [
        state.confirm,
        state.prevConfirm,
        haveList,
        state.active,
        next,
        list,
        onConfirm
    ]);

    const onKey = useCallback(event => {
        if (isCtrl(event)) {
            return null;
        }
        if (isEnter(event)) {
            return dispatch({ type: CONFIRMED });
        }

        const { dy } = getNavDirection(event);
        if (!dy) {
            return null;
        }

        event.stopPropagation();

        if (dy > 0) {
            return dispatch({ type: NAV_NEXT });
        }

        return dispatch({ type: NAV_PREV });
    }, []);

    useEffect(() => {
        if (haveList) {
            window.addEventListener('keydown', onKey);
        } else {
            window.removeEventListener('keydown', onKey);
        }
    }, [onKey, haveList]);

    useEffect(() => () => window.removeEventListener('keydown', onKey), [onKey]);

    if (!haveList) {
        return null;
    }

    return (
        <ul className="suggestions">
            {list.map((value, index) => (
                <li key={value} className={classNames('suggestion', {
                    active: index === active
                })}>{value}</li>
            ))}
        </ul>
    );
}

SuggestionsList.propTypes = {
    page: PropTypes.string.isRequired,
    column: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    list: PropTypes.arrayOf(PropTypes.string.isRequired),
    next: PropTypes.arrayOf(PropTypes.string.isRequired),
    request: PropTypes.func.isRequired,
    clear: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    list: state.suggestions.list,
    next: state.suggestions.next
});

const mapDispatchToProps = {
    request: suggestionsRequested,
    clear: suggestionsCleared
};

export default connect(mapStateToProps, mapDispatchToProps)(SuggestionsList);
