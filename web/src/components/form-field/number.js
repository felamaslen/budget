import React from 'react';
import PropTypes from 'prop-types';

export default function FormFieldNumber({ value, onChange }) {
    const procValue = +value;
    const procOnChange = evt => onChange(+evt.target.value);

    return <input type="number" defaultValue={procValue} onChange={procOnChange} />;
}

FormFieldNumber.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};

