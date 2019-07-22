import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { SketchPicker } from 'react-color';

export default function FormFieldColor({ value, onChange }) {
    const [active, setActive] = useState(false);
    const toggle = useCallback(() => setActive(last => !last), []);

    const onChangeComplete = useCallback(color => {
        onChange(color.hex);
    }, [onChange]);

    return (
        <div className={classNames('form-field', 'form-field-color')}>
            <button className="color-value" onClick={toggle}>
                {'Edit colour'}
            </button>
            {active && <SketchPicker
                className="color-picker"
                color={value}
                onChangeComplete={onChangeComplete}
            />}
        </div>
    );
}

FormFieldColor.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};
