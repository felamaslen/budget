import React from 'react';
import PropTypes from 'prop-types';

import { useField } from './use-field';

export default function FormFieldCost({ value, onChange }) {
    const [currentValue, onType, onBlur] = useField(
        value,
        onChange,
        cost => cost || 0,
        cost => Math.round(100 * Number(cost))
    );

    return (
        <div className="form-field form-field-cost">
            <input
                type="number"
                step="0.01"
                defaultValue={currentValue / 100}
                onChange={onType}
                onBlur={onBlur}
            />
        </div>
    );
}

FormFieldCost.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};
