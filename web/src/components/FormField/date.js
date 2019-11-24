import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import { Wrapper } from '~client/components/FormField';
import { useField } from '~client/hooks/field';

const setValueDate = isoDate => DateTime.fromISO(isoDate);

function parseYear(year) {
    if (year && year.length <= 2) {
        return 2000 + Number(year);
    }

    return Number(year);
}

function setValueString(date) {
    const shortMatch = date.match(/^(\d{1,2})(\/(\d{1,2})(\/(\d{2,4}))?)?$/);
    if (!shortMatch) {
        throw new Error('Not a valid date');
    }

    const [, day, , month, , year] = shortMatch;

    const now = DateTime.local();

    const result = DateTime.fromObject({
        year: parseYear(year) || now.year,
        month: Number(month) || now.month,
        day: Number(day) || now.day,
    });

    if (result.invalid) {
        return now;
    }

    return result;
}

export default function FormFieldDate({ label, invalid, ...props }) {
    let setValue = setValueDate;
    let type = 'date';

    if (props.string) {
        setValue = setValueString;
        type = 'text';
    }

    const [, , onChange, ref, onBlur] = useField({
        ...props,
        setValue,
    });

    const defaultValue = props.string
        ? props.value.toLocaleString(DateTime.DATE_SHORT)
        : props.value.toISODate();

    return (
        <Wrapper item="date" value={props.value} active={props.active} invalid={invalid}>
            <input
                ref={ref}
                aria-label={label}
                type={type}
                defaultValue={defaultValue}
                onChange={onChange}
                onBlur={onBlur}
            />
        </Wrapper>
    );
}

FormFieldDate.propTypes = {
    string: PropTypes.bool,
    label: PropTypes.string,
    value: PropTypes.instanceOf(DateTime),
    active: PropTypes.bool,
    invalid: PropTypes.bool,
};

FormFieldDate.defaultProps = {
    invalid: false,
    string: false,
    label: null,
    value: DateTime.local(),
};
