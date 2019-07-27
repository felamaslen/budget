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
        return { ...state, currentValue: state.initialValue };
    }
    if (action.type === ACTIVE_TOGGLED) {
        if (action.active && !state.active) {
            return {
                ...state,
                active: true,
                initialValue: action.value,
                currentValue: action.value
            };
        }

        return {
            ...state,
            active: action.active,
            inputValue: action.inputValue
        };
    }
    if (action.type === TYPED) {
        const { value: currentValue, inputValue = currentValue } = action;

        return { ...state, currentValue, inputValue };
    }

    return state;
}

export function useField({
    value,
    string = false,
    onChange,
    onType = NULL,
    setValue = IDENTITY,
    getInitialInputValue = IDENTITY,
    command = NULL_COMMAND,
    active = false
}) {
    const inputRef = useRef(null);

    const [state, dispatch] = useReducer(fieldReducer, {
        active: false,
        initialValue: value,
        currentValue: value,
        inputValue: getInitialInputValue(value)
    });

    useEffect(() => {
        dispatch({ type: VALUE_SET, payload: value });
    }, [value]);

    useEffect(() => {
        if (!string) {
            return;
        }
        if (!active && state.active && state.currentValue !== state.initialValue) {
            onChange(state.currentValue);
        }
        if (active !== state.active) {
            dispatch({
                type: ACTIVE_TOGGLED,
                active,
                value,
                inputValue: getInitialInputValue(state.currentValue)
            });
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
    }, [string, onChange, active, value, state.active, state.currentValue, state.initialValue, getInitialInputValue]);

    useEffect(() => {
        if (string && command !== NULL_COMMAND) {
            dispatch(command);
        }
    }, [string, command]);

    const onChangeInput = useCallback(event => {
        try {
            const newValue = setValue(event.target.value);
            if (typeof newValue === 'object' && newValue.__split) {
                const { fieldValue, inputValue } = newValue;
                dispatch({
                    type: TYPED,
                    value: fieldValue,
                    inputValue
                });
            } else {
                dispatch({ type: TYPED, value: newValue });
            }

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

    return [
        state.currentValue,
        state.inputValue,
        onChangeInput,
        inputRef,
        onBlurInput
    ];
}
