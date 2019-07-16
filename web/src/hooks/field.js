/**
 * Hook for an interactive, generic form field
 * `setValue` is used to set the *state value* from the *input value*
 * Components which use this hook are responsible for rendering the input,
 */

import { useRef, useReducer, useCallback, useEffect } from 'react';

import { NULL, IDENTITY } from '~client/modules/data';
import { VALUE_SET, CANCELLED } from '~client/modules/nav';
import { NULL_COMMAND } from '~client/hooks/nav';

const ACTIVE_TOGGLED = 'ACTIVE_TOGGLED';
const TYPED = 'TYPED';

function fieldReducer(state, action) {
    if (action.type === VALUE_SET) {
        return { ...state, currentValue: action.payload };
    }
    if (action.type === CANCELLED) {
        return { ...state, currentValue: state.initialValue, cancelled: true };
    }
    if (action.type === ACTIVE_TOGGLED) {
        if (action.active && !state.active) {
            return {
                ...state,
                active: true,
                cancelled: false,
                initialValue: action.value,
                currentValue: action.value
            };
        }

        return { ...state, active: action.active };
    }
    if (action.type === TYPED) {
        return { ...state, currentValue: action.value };
    }

    return state;
}

export function useField({
    value,
    string = false,
    onChange,
    onType = NULL,
    setValue = IDENTITY,
    command = NULL_COMMAND,
    active = false
}) {
    const inputRef = useRef(null);

    const [state, dispatch] = useReducer(fieldReducer, {
        active: false,
        cancelled: false,
        initialValue: value,
        currentValue: value
    });

    useEffect(() => {
        if (string) {
            dispatch({ type: VALUE_SET, payload: value });
        }
    }, [string, value]);

    useEffect(() => {
        if (!string) {
            return;
        }
        if (!active && state.active && state.currentValue !== state.initialValue) {
            onChange(state.currentValue);
        }
        if (active !== state.active) {
            dispatch({ type: ACTIVE_TOGGLED, active, value });
        }
        if (active && !state.active) {
            setImmediate(() => {
                if (!inputRef.current) {
                    return;
                }

                inputRef.current.focus();
                inputRef.current.select();
            });
        } else if (!active && state.active && inputRef.current) {
            inputRef.current.blur();
        }
    }, [string, onChange, active, value, state.active, state.currentValue, state.initialValue]);

    useEffect(() => {
        if (string && command !== NULL_COMMAND) {
            dispatch(command);
        }
    }, [string, command]);

    const onChangeInput = useCallback(event => {
        try {
            const newValue = setValue(event.target.value);
            dispatch({ type: TYPED, value: newValue });
            onType(newValue);
        } catch {
            // do nothing
        }
    }, [setValue, onType]);

    const onBlurInput = useCallback(() => {
        if (!string) {
            onChange(state.currentValue);
        }
    }, [string, onChange, state.currentValue]);

    return [state.currentValue, onChangeInput, inputRef, onBlurInput];
}
