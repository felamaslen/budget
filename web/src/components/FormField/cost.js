import React from 'react';
import PropTypes from 'prop-types';

import { useField } from './use-field';

export default function FormFieldCost({ value, onChange, active }) {
    const [currentValue, onType, onBlur, ref] = useField(
        value,
        onChange,
        cost => cost || 0,
        cost => Math.round(100 * Number(cost)),
        active
    );

    return (
        <div className="form-field form-field-cost">
            <input
                ref={ref}
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
    active: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};
