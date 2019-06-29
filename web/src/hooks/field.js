import { useRef, useState, useCallback, useEffect } from 'react';

export function useField(
    value,
    onChange,
    getValue,
    setValue,
    active
) {
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

    const onType = useCallback(evt => {
        setCurrentValue(setValue(evt.target.value));
    }, [setCurrentValue, setValue]);

    const onBlur = useCallback(() => {
        onChange(currentValue);
    }, [onChange, currentValue]);

    return [currentValue, onType, onBlur, inputRef];
}
