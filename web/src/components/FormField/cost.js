import React from 'react';
import PropTypes from 'prop-types';

import { Wrapper } from '~client/components/FormField';
import { useField } from '~client/hooks/field';

const setValue = cost => Math.round((100 * (Number(cost) || 0)).toPrecision(10));

function setValueString(inputValue) {
    if (inputValue === '.') {
        return { __split: true, fieldValue: 0, inputValue: '.' };
    }
    if (isNaN(Number(inputValue))) {
        throw new Error('Invalid value');
    }

    const fieldValue = setValue(inputValue);
    if (inputValue.match('.')) {
        return { __split: true, fieldValue, inputValue };
    }

    return { __split: true, fieldValue, inputValue: String(fieldValue / 100) };
}

function setValueNumber(inputValue) {
    const fieldValue = setValue(inputValue);

    return { __split: true, fieldValue, inputValue: String(fieldValue / 100) };
}

function getInitialInputValue(value) {
    if (value === null || typeof value === 'string') {
        return '';
    }

    return String(value / 100);
}

export default function FormFieldCost(props) {
    const [, inputValue, onChange, ref, onBlur] = useField({
        ...props,
        getInitialInputValue,
        setValue: props.string
            ? setValueString
            : setValueNumber
    });

    const inputProps = props.string
        ? { type: 'text' }
        : { type: 'number', step: 0.01 };

    return (
        <Wrapper item="cost" value={props.value} active={props.active}>
            <input
                ref={ref}
                {...inputProps}
                value={inputValue}
                onChange={onChange}
                onBlur={onBlur}
            />
        </Wrapper>
    );
}

FormFieldCost.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    active: PropTypes.bool,
    string: PropTypes.bool
};

FormFieldCost.defaultProps = {
    string: false,
    value: null
};
