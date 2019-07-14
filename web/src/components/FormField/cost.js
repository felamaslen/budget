import React from 'react';
import PropTypes from 'prop-types';

import { useField } from '~client/hooks/field';

const getValue = cost => cost || 0;
const setValue = cost => Math.round(100 * (Number(cost) || 0));

export default function FormFieldCost({ string, value, onChange, active }) {
    const [currentValue, onType, onBlur, ref] = useField({
        value,
        onChange,
        getValue,
        setValue,
        active
    });

    const inputProps = string
        ? { type: 'text' }
        : { type: 'number', step: 0.01 };

    return (
        <div className="form-field form-field-cost">
            <input
                ref={ref}
                {...inputProps}
                defaultValue={value === null
                    ? ''
                    : currentValue / 100}
                onChange={onType}
                onBlur={onBlur}
            />
        </div>
    );
}

FormFieldCost.propTypes = {
    value: PropTypes.number,
    active: PropTypes.bool,
    string: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};

FormFieldCost.defaultProps = {
    string: false,
    value: null
};
