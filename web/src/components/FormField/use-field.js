import { useState, useCallback } from 'react';

export function useField(value, onChange, getValue, setValue) {
    const [currentValue, setCurrentValue] = useState(getValue(value));

    const onType = useCallback(evt => {
        setCurrentValue(setValue(evt.target.value));
    }, [setCurrentValue, setValue]);

    const onBlur = useCallback(() => {
        onChange(currentValue);
    }, [onChange, currentValue]);

    return [currentValue, onType, onBlur];
}

