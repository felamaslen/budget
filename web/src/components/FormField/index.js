import React from 'react';
import PropTypes from 'prop-types';

import { useField } from './use-field';

export default function FormFieldText({ value, onChange }) {
    const [currentValue, onType, onBlur] = useField(
        value,
        onChange,
        text => text,
        text => text
    );

    return (
        <div className="form-field form-field-text">
            <input
                type="text"
                defaultValue={currentValue}
                onChange={onType}
                onBlur={onBlur}
            />
        </div>
    );
}

FormFieldText.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

