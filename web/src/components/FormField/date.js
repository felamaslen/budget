import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import { dateInput } from '~client/helpers/date';

import { useField } from './use-field';

export default function FormFieldDate({ value, onChange }) {
    const [currentValue, onType, onBlur] = useField(
        value,
        onChange,
        date => dateInput(date, false),
        date => dateInput(date, false)
    );

    return (
        <div className="form-field form-field-date">
            <input
                type="date"
                defaultValue={currentValue.toISODate()}
                onChange={onType}
                onBlur={onBlur}
            />
        </div>
    );
}

FormFieldDate.propTypes = {
    value: PropTypes.instanceOf(DateTime).isRequired,
    onChange: PropTypes.func.isRequired
};

