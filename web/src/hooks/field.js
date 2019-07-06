import { useRef, useState, useCallback, useEffect } from 'react';

const noop = value => value;

export function useField({
    value,
    onChange,
    onType = noop,
    getValue = noop,
    setValue = noop,
    active
}) {
    const inputRef = useRef(null);
    const [wasActive, setWasActive] = useState(active);
    useEffect(() => {
        if (active && !wasActive && inputRef.current && inputRef.current.focus) {
            inputRef.current.focus();
        } else if (!active && wasActive && inputRef.current && inputRef.current.blur) {
            inputRef.current.blur();
        }

        setWasActive(active);
    }, [active, wasActive]);

    const [prevValue, setPrevValue] = useState(value);
    const [currentValue, setCurrentValue] = useState(getValue(value));

    useEffect(() => {
        if (value !== prevValue) {
            setPrevValue(value);
            setCurrentValue(getValue(value));
        }
    }, [value, prevValue, getValue]);

    const onChangeRaw = useCallback(evt => {
        try {
            const newValue = setValue(evt.target.value);
            setCurrentValue(newValue);
            onType(newValue);
        } catch {
            // do nothing
        }
    }, [setCurrentValue, setValue, onType]);

    const onBlur = useCallback(() => {
        onChange(currentValue);
    }, [onChange, currentValue]);

    return [currentValue, onChangeRaw, onBlur, inputRef];
}
