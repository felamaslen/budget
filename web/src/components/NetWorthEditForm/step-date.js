import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import FormContainer from '~client/components/NetWorthEditForm/form-container';
import FormFieldDate from '~client/components/FormField/date';

export default function StepDate({ containerProps, item, onEdit }) {
    const onChange = useCallback(date => {
        onEdit({
            ...item,
            date: date.toISODate()
        });
    }, [item, onEdit]);

    return (
        <FormContainer {...containerProps}>
            <h5>{'On what date were the data collected?'}</h5>
            <FormFieldDate value={DateTime.fromISO(item.date)} onChange={onChange} />
        </FormContainer>
    );
}

StepDate.propTypes = {
    containerProps: PropTypes.object.isRequired,
    item: PropTypes.shape({
        date: PropTypes.string.isRequired
    }),
    onEdit: PropTypes.func.isRequired
};
