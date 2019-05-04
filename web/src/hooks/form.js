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

function useInput(initialValue, props, InputComponent) {
    const [tempValue, setTempValue] = useState(initialValue);
    const onChange = useCallback(evt => {
        setTempValue(evt.target.value);
    }, []);

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

    return [tempValue, Input, touched];
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

    InputComponentSelect.propTypes = inputTextPropTypes;

    return InputComponentSelect;
};

export function useInputSelect(initialValue, options, props = {}) {
    const InputComponentSelect = useMemo(() => makeInputComponentSelect(options), [options]);

    return useInput(initialValue, props, InputComponentSelect);
}

const makeInputComponentColor = (active, setActive) => {
    const InputComponentColor = ({ props, tempValue, setTempValue }) => {
        const Input = (
            <span key="inactive"
                {...props}
                onClick={() => setActive(true)}
            >{'Edit colour'}</span>
        );

        const onChangeComplete = useCallback(color => {
            setTempValue(color.hex);
            setActive(false);
        }, [setTempValue]);


        if (!active) {
            return Input;
        }

        return [
            Input,
            <SketchPicker key="active"
                {...props}
                color={tempValue}
                onChangeComplete={onChangeComplete}
            />
        ];
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
