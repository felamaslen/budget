import React from 'react';
import PropTypes from 'prop-types';

export default function FormFieldText({ value, onChange }) {
    const procOnChange = evt => onChange(evt.target.value);

    return <div className="form-field form-field-text">
        <input type="text" defaultValue={value} onChange={procOnChange} />
    </div>;
}

FormFieldText.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

