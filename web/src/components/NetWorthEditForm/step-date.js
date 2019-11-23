import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import FormContainer from '~client/components/NetWorthEditForm/form-container';
import FormFieldDate from '~client/components/FormField/date';

import { STEP_DATE } from './constants';
import * as Styled from './styles';

export default function StepDate({ containerProps, item, onEdit }) {
    const onChange = useCallback(date => onEdit({ ...item, date }), [item, onEdit]);

    return (
        <FormContainer {...containerProps} step={STEP_DATE} className="step-date">
            <Styled.SectionTitle className="net-worth-edit-form-section-title">
                {'On what date were the data collected?'}
            </Styled.SectionTitle>
            <FormFieldDate value={item.date} onChange={onChange} />
        </FormContainer>
    );
}

StepDate.propTypes = {
    containerProps: PropTypes.object.isRequired,
    item: PropTypes.shape({
        date: PropTypes.instanceOf(DateTime).isRequired,
    }),
    onEdit: PropTypes.func.isRequired,
};
