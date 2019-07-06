import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import { useField } from '~client/hooks/field';

const setValueDate = isoDate => DateTime.fromISO(isoDate);

function setValueString(date) {
    const shortMatch = date.match(/^(\d{1,2})(\/(\d{1,2})(\/(\d{2,4}))?)?$/);
    if (!shortMatch) {
        throw new Error('Not a valid date');
    }

    const [, day, , month, , year] = shortMatch;

    const now = DateTime.local();

    return DateTime.fromObject({
        year: (Number(year) + 2000) || now.year,
        month: Number(month) || now.month,
        day: Number(day) || now.day
    });
}

export default function FormFieldDate({ string, value, onChange, active }) {
    let setValue = setValueDate;
    let type = 'date';

    if (string) {
        setValue = setValueString;
        type = 'text';
    }

    const [, onChangeRaw, onBlur, ref] = useField({
        value,
        onChange,
        setValue,
        active
    });

    const defaultValue = string
        ? value.toLocaleString(DateTime.DATE_SHORT)
        : value.toISODate();

    return (
        <div className="form-field form-field-date">
            <input
                ref={ref}
                type={type}
                defaultValue={defaultValue}
                onChange={onChangeRaw}
                onBlur={onBlur}
            />
        </div>
    );
}

FormFieldDate.propTypes = {
    string: PropTypes.bool,
    value: PropTypes.instanceOf(DateTime).isRequired,
    active: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};

FormFieldDate.defaultProps = {
    string: false
};
