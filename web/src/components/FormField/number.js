import React from 'react';
import PropTypes from 'prop-types';

import { useField } from '~client/hooks/field';

export default function FormFieldNumber({ value, onChange, active, ...props }) {
    const [currentValue, onType, onBlur, ref] = useField({
        value,
        onChange,
        setValue: Number,
        active
    });

    return (
        <div className="form-field form-field-number">
            <input
                {...props}
                ref={ref}
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
    active: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};
