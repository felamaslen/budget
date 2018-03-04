import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { dateInput } from '../../misc/date';

export default function FormFieldDate({ value, onChange }) {
    const procValue = value.format('YYYY-MM-DD');
    const procOnChange = evt => onChange(dateInput(evt.target.value));

    return <div className="form-field form-field-date">
        <input type="date" defaultValue={procValue} onChange={procOnChange} />
    </div>;
}

FormFieldDate.propTypes = {
    value: PropTypes.instanceOf(moment).isRequired,
    onChange: PropTypes.func.isRequired
};

