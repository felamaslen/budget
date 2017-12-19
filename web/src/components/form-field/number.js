import React from 'react';
import PropTypes from 'prop-types';

export default function FormFieldNumber({ value, onChange }) {
    const procValue = Number(value);
    const procOnChange = evt => onChange(Number(evt.target.value));

    return <div className="form-field form-field-number">
        <input type="number" defaultValue={procValue} onChange={procOnChange} />
    </div>;
}

FormFieldNumber.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};

