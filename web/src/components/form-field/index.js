import React from 'react';
import PropTypes from 'prop-types';

export default function FormFieldText({ value, onChange }) {
    return <div className="form-field form-field-text">
        <input type="text" defaultValue={value} onChange={onChange} />
    </div>;
}

FormFieldText.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

