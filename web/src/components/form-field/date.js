import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import { dateInput } from '../../misc/date';

export default function FormFieldDate({ value, onChange }) {
    const procValue = value.toISODate();
    const procOnChange = evt => onChange(dateInput(evt.target.value, false));

    return <div className="form-field form-field-date">
        <input type="date" defaultValue={procValue} onChange={procOnChange} />
    </div>;
}

FormFieldDate.propTypes = {
    value: PropTypes.instanceOf(DateTime).isRequired,
    onChange: PropTypes.func.isRequired
};

