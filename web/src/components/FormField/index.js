import React from 'react';
import PropTypes from 'prop-types';

import { useField } from '~client/hooks/field';

export default function FormFieldText({ value, onType, onChange, active }) {
    const [currentValue, onChangeRaw, onBlur, ref] = useField({
        value,
        onType,
        onChange,
        active
    });

    return (
        <div className="form-field form-field-text">
            <input
                ref={ref}
                type="text"
                defaultValue={currentValue}
                onChange={onChangeRaw}
                onBlur={onBlur}
            />
        </div>
    );
}

FormFieldText.propTypes = {
    value: PropTypes.string,
    active: PropTypes.bool,
    onType: PropTypes.func,
    onChange: PropTypes.func.isRequired
};

FormFieldText.defaultProps = {
    value: '',
    onType: () => null
};
