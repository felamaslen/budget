import React from 'react';
import PropTypes from 'prop-types';

export default function FormFieldCost({ value, onChange }) {
    const procValue = value / 100;
    const procOnChange = evt => onChange(Math.round(100 * (+evt.target.value)));

    return <div className="form-field form-field-cost">
        <input type="number" step="0.01" defaultValue={procValue} onChange={procOnChange} />
    </div>;
}

FormFieldCost.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};

