import { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'throttle-debounce';

import { useApi } from '~client/hooks/api';
import { isShift, isTab, isEscape, isEnter } from '~client/modules/nav';
import { PAGES_SUGGESTIONS, MAX_SUGGESTIONS } from '~client/constants/data';

const initialList = { list: [], active: null, next: [], set: null };

export function useSuggestions({ apiKey, page }) {
    const [suggestions, setSuggestions] = useState(initialList);

    const clear = useCallback(() => {
        setSuggestions(initialList);
    }, []);

    const onSuccess = useCallback(({ data: { list, nextCategory: next } }) => {
        setSuggestions({ list, active: null, next, set: null });
    }, []);

    const navActive = useCallback(direction => {
        setSuggestions(({ list, active, ...rest }) => ({
            list,
            active: list[(list.indexOf(active) + direction + list.length) % list.length],
            ...rest
        }));
    }, []);

    const onNav = useCallback(event => {
        if (isEscape(event)) {
            setSuggestions(initialList);
        } else if (isTab(event)) {
            if (isShift(event)) {
                navActive(-1);
            } else {
                navActive(1);
            }
        } else if (isEnter(event)) {
            setSuggestions(({ list, active, next }) => ({
                ...initialList,
                set: [active, next[list.indexOf(active)]]
            }));
        }
    }, [navActive]);

    useEffect(() => {
        if (suggestions.list.length) {
            window.addEventListener('keydown', onNav);
        } else {
            window.removeEventListener('keydown', onNav);
        }

        return () => window.removeEventListener('keydown', onNav);
    }, [onNav, suggestions.list.length]);

    const [requestSuggestions, loading, error] = useApi({
        url: `/data/search/${page}`,
        apiKey,
        onSuccess
    });

    const requestSuggestionsDebounced = useMemo(() => debounce(100, requestSuggestions), [requestSuggestions]);

    const refresh = useCallback((column, value) => {
        requestSuggestionsDebounced(`${column}/${value}/${MAX_SUGGESTIONS}`);
    }, [requestSuggestionsDebounced]);

    if (!PAGES_SUGGESTIONS.includes(page)) {
        return [initialList];
    }

    return [
        suggestions,
        clear,
        refresh,
        loading,
        error
    ];
}

export const suggestionsShape = PropTypes.shape({
    list: PropTypes.arrayOf(PropTypes.string.isRequired),
    active: PropTypes.string,
    next: PropTypes.arrayOf(PropTypes.string.isRequired),
    set: PropTypes.arrayOf(PropTypes.string.isRequired)
});
