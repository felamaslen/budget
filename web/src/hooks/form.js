import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';

const InputComponentText = ({ props, tempValue, onChange }) => (
    <input {...props} type="text" value={tempValue} onChange={onChange} />
);

const inputTextPropTypes = {
    props: PropTypes.object.isRequired,
    tempValue: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

InputComponentText.propTypes = inputTextPropTypes;

const handleChangeDefault = setTempValue => evt => {
    setTempValue(evt.target.value);
};

function useInput(initialValue, props, InputComponent, handleChange = handleChangeDefault) {
    const [tempValue, setTempValue] = useState(initialValue);
    const onChangeDefault = useCallback(handleChangeDefault(setTempValue), []);
    const onChangeCustom = useCallback(handleChange(setTempValue, tempValue), [tempValue]);

    const onChange = handleChange === handleChangeDefault
        ? onChangeDefault
        : onChangeCustom;

    useEffect(() => {
        setTempValue(initialValue);
    }, [initialValue]);

    const Input = (
        <InputComponent
            props={props}
            tempValue={tempValue}
            setTempValue={setTempValue}
            onChange={onChange}
        />
    );

    const touched = initialValue !== tempValue;

    return [tempValue, Input, touched, setTempValue];
}

export function useInputText(initialValue, props = {}) {
    return useInput(initialValue, props, InputComponentText);
}

const makeInputComponentSelect = options => {
    const InputComponentSelect = ({ props, tempValue, onChange }) => (
        <select {...props} value={tempValue} onChange={onChange}>
            {options.map(({ internal, external }) => (
                <option key={internal} value={internal}>
                    {external}
                </option>
            ))}
        </select>
    );

    InputComponentSelect.propTypes = {
        ...inputTextPropTypes,
        tempValue: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ])
    };

    return InputComponentSelect;
};

export function useInputSelect(initialValue, optionsRaw, props = {}) {
    const options = useMemo(() => optionsRaw.map(option => {
        if (typeof option === 'object') {
            return option;
        }

        return { internal: option, external: option };
    }), [optionsRaw]);

    const InputComponentSelect = useMemo(() => makeInputComponentSelect(options), [options]);

    const input = useInput(initialValue, props, InputComponentSelect);

    const [tempValue, , , setTempValue] = input;

    useEffect(() => {
        if (!options.some(({ internal }) => internal === tempValue)) {
            if (options.length) {
                setTempValue(options[0].internal);
            } else {
                setTempValue(null);
            }
        }
    }, [options, tempValue, setTempValue]);

    return input;
}

const makeInputComponentColor = (active, setActive) => {
    const InputComponentColor = ({ props, tempValue, setTempValue }) => {
        const { className, ...otherProps } = props;

        const Input = (
            <button className="color-value"
                onClick={() => setActive(!active)}
            >{'Edit colour'}</button>
        );

        const onChangeComplete = useCallback(color => {
            setTempValue(color.hex);
        }, [setTempValue]);

        return (
            <div className={className}>
                {Input}
                {active && <SketchPicker
                    className="color-picker"
                    {...otherProps}
                    color={tempValue}
                    onChangeComplete={onChangeComplete}
                />}
            </div>
        );
    };

    InputComponentColor.propTypes = {
        setTempValue: PropTypes.func.isRequired,
        ...inputTextPropTypes
    };

    return InputComponentColor;
};

export function useInputColor(initialValue, props = {}) {
    const [active, setActive] = useState(false);

    const InputComponentColor = useMemo(() => makeInputComponentColor(active, setActive), [active, setActive]);

    return useInput(initialValue, props, InputComponentColor);
}

const InputTickbox = ({ props, tempValue, onChange }) => (
    <input {...props} type="checkbox" checked={Boolean(tempValue)} onChange={onChange} />
);

InputTickbox.propTypes = {
    ...inputTextPropTypes,
    tempValue: PropTypes.bool
};

export function useInputTickbox(initialValue, props = {}) {
    const handleChange = (setTempValue, tempValue) => () => setTempValue(!tempValue);

    return useInput(initialValue, props, InputTickbox, handleChange);
}

const InputRange = ({ props, tempValue, onChange }) => (
    <input {...props} type="range" value={tempValue} onChange={onChange} />
);

InputRange.propTypes = {
    props: PropTypes.shape({
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired
    }),
    tempValue: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};

const handleChangeNumeric = setTempValue => evt => {
    setTempValue(Number(evt.target.value));
};

export function useInputRange(initialValue, props = {}) {
    return useInput(initialValue, props, InputRange, handleChangeNumeric);
}
