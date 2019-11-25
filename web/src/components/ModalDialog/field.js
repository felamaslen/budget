import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import FormFieldText from '~client/components/FormField';
import FormFieldDate from '~client/components/FormField/date';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldTransactions from '~client/components/FormField/transactions';
import * as Styled from './styles';

const FormFieldContainer = ({ children, item }) => (
    <Styled.FormRow item={item}>
        <Styled.FormLabel>{item}</Styled.FormLabel>
        {children}
    </Styled.FormRow>
);

FormFieldContainer.propTypes = {
    item: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default function ModalDialogField({ item, value, invalid, onChange }) {
    const onChangeCallback = useCallback(newValue => onChange(item, newValue), [onChange, item]);

    if (item === 'date') {
        return (
            <FormFieldContainer item={item}>
                <FormFieldDate invalid={invalid} value={value} onChange={onChangeCallback} />
            </FormFieldContainer>
        );
    }
    if (item === 'cost') {
        return (
            <FormFieldContainer item={item}>
                <FormFieldCost invalid={invalid} value={value} onChange={onChangeCallback} />
            </FormFieldContainer>
        );
    }
    if (item === 'transactions') {
        return (
            <Styled.FormRow item={item}>
                <Styled.FormRowInner item={item}>
                    <Styled.FormLabel item={item}>{item}</Styled.FormLabel>
                    <FormFieldTransactions
                        invalid={invalid}
                        value={value}
                        onChange={onChangeCallback}
                        active
                    />
                </Styled.FormRowInner>
            </Styled.FormRow>
        );
    }

    return (
        <FormFieldContainer item={item}>
            <FormFieldText invalid={invalid} value={value} onChange={onChangeCallback} />
        </FormFieldContainer>
    );
}

ModalDialogField.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    invalid: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};
