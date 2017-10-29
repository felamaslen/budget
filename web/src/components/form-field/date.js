import React from 'react';
import PropTypes from 'prop-types';
import { YMD } from '../../misc/date';

export default function FormFieldDate({ value, onChange }) {
    const procValue = value.formatISO();
    const procOnChange = evt => {
        const processed = new YMD(evt.target.value);

        if (processed.valid) {
            return onChange(processed);
        }

        return onChange(null);
    };

    return <input type="date" defaultValue={procValue} onChange={procOnChange} />;
}

FormFieldDate.propTypes = {
    value: PropTypes.instanceOf(YMD).isRequired,
    onChange: PropTypes.func.isRequired
};

