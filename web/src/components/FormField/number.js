import React from 'react';
import PropTypes from 'prop-types';

import { useField } from './use-field';

export default function FormFieldNumber({ value, onChange, ...props }) {
    const [currentValue, onType, onBlur] = useField(
        value,
        onChange,
        number => number,
        Number
    );

    return (
        <div className="form-field form-field-number">
            <input
                {...props}
                type="number"
                value={currentValue}
                onChange={onType}
                onBlur={onBlur}
            />
        </div>
    );
}

FormFieldNumber.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};
