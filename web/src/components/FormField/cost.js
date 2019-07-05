import React from 'react';
import PropTypes from 'prop-types';

import { useField } from '~client/hooks/field';

const getValue = cost => cost || 0;
const setValue = cost => Math.round(100 * Number(cost));

export default function FormFieldCost({ value, onChange, active }) {
    const [currentValue, onType, onBlur, ref] = useField({
        value,
        onChange,
        getValue,
        setValue,
        active
    });

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
