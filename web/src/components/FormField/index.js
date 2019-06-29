import React from 'react';
import PropTypes from 'prop-types';

import { useField } from '~client/hooks/use-field';

export default function FormFieldText({ value, onChange, active }) {
    const [currentValue, onType, onBlur, ref] = useField(
        value,
        onChange,
        text => text,
        text => text,
        active
    );

    return (
        <div className="form-field form-field-text">
            <input
                ref={ref}
                type="text"
                defaultValue={currentValue}
                onChange={onType}
                onBlur={onBlur}
            />
        </div>
    );
}

FormFieldText.propTypes = {
    value: PropTypes.string.isRequired,
    active: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};
