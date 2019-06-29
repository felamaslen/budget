import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import { dateInput } from '~client/modules/date';

import { useField } from './use-field';

export default function FormFieldDate({ value, onChange, active }) {
    const [currentValue, onType, onBlur, ref] = useField(
        value,
        onChange,
        date => dateInput(date, false),
        date => dateInput(date, false),
        active
    );

    return (
        <div className="form-field form-field-date">
            <input
                ref={ref}
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
    active: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};
