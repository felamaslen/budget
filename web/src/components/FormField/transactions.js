import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import { useField } from '~client/hooks/field';
import { Button } from '~client/styled/shared/button';
import { Wrapper } from '~client/components/FormField';
import FormFieldDate from '~client/components/FormField/date';
import FormFieldNumber from '~client/components/FormField/number';
import FormFieldCost from '~client/components/FormField/cost';
import {
    addToTransactionsList,
    modifyTransactionById,
    transactionShape,
    transactionsListShape,
} from '~client/modules/data';
import { CREATE_ID } from '~client/constants/data';

import * as Styled from './styles';

function FormFieldTransaction({ item, children, onChange, active }) {
    const onChangeDate = useCallback(value => onChange(item.id, 'date', value), [
        onChange,
        item.id,
    ]);
    const onChangeUnits = useCallback(value => onChange(item.id, 'units', value), [
        onChange,
        item.id,
    ]);
    const onChangeCost = useCallback(value => onChange(item.id, 'cost', value), [
        onChange,
        item.id,
    ]);

    return (
        <Styled.TransactionsListItem>
            <Styled.TransactionRowDate>
                <Styled.TransactionLabel>{'Date:'}</Styled.TransactionLabel>
                <Styled.TransactionCol>
                    <FormFieldDate value={item.date} onChange={onChangeDate} active={active} />
                </Styled.TransactionCol>
            </Styled.TransactionRowDate>
            <Styled.TransactionRowUnits>
                <Styled.TransactionLabel>{'Units:'}</Styled.TransactionLabel>
                <Styled.TransactionCol>
                    <FormFieldNumber value={item.units} onChange={onChangeUnits} active={active} />
                </Styled.TransactionCol>
            </Styled.TransactionRowUnits>
            <Styled.TransactionRowCost>
                <Styled.TransactionLabel>{'Cost:'}</Styled.TransactionLabel>
                <Styled.TransactionCol>
                    <FormFieldCost value={item.cost} onChange={onChangeCost} active={active} />
                </Styled.TransactionCol>
            </Styled.TransactionRowCost>
            {children}
        </Styled.TransactionsListItem>
    );
}

FormFieldTransaction.propTypes = {
    item: transactionShape,
    children: PropTypes.node,
    onChange: PropTypes.func.isRequired,
    active: PropTypes.bool,
};

const newItemInit = {
    id: CREATE_ID,
    date: DateTime.local(),
    units: 0,
    cost: 0,
};

function FormFieldTransactions({ create, invalid, ...props }) {
    const [currentValue, , onChangeInput] = useField({
        ...props,
        string: true,
    });

    const onChange = useCallback(
        value =>
            onChangeInput({
                target: { value },
            }),
        [onChangeInput],
    );

    const { value, active } = props;

    const onChangeTransaction = useCallback(
        (id, field, fieldValue) =>
            onChange(
                modifyTransactionById(value, id, {
                    [field]: fieldValue,
                }),
            ),
        [value, onChange],
    );

    const onRemoveTransaction = useCallback(
        id => onChange(currentValue.filter(({ id: valueId }) => valueId !== id)),
        [currentValue, onChange],
    );

    const [newItem, setNewItem] = useState(newItemInit);

    const onChangeAddField = useCallback(
        (id, field, fieldValue) =>
            setNewItem(last => ({
                ...last,
                [field]: fieldValue,
            })),
        [],
    );

    const onAdd = useCallback(() => {
        if (!newItem) {
            return;
        }

        setNewItem(newItemInit);
        onChange(addToTransactionsList(currentValue, newItem));
    }, [newItem, currentValue, onChange]);

    return (
        <Wrapper item="transactions" value={value} active invalid={invalid}>
            <Styled.NumTransactions active={active}>{(value || []).length}</Styled.NumTransactions>
            {currentValue && active && (
                <Styled.TransactionsModal>
                    <Styled.ModalInner>
                        {create && (
                            <Styled.ModalHead>
                                <Styled.ModalHeadDate>{'Date'}</Styled.ModalHeadDate>
                                <Styled.ModalHeadUnits>{'Units'}</Styled.ModalHeadUnits>
                                <Styled.ModalHeadCost>{'Cost'}</Styled.ModalHeadCost>
                            </Styled.ModalHead>
                        )}
                        <Styled.TransactionsList>
                            {create && (
                                <FormFieldTransaction item={newItem} onChange={onChangeAddField}>
                                    <Styled.TransactionRowButton>
                                        <Button onClick={onAdd}>{'+'}</Button>
                                    </Styled.TransactionRowButton>
                                </FormFieldTransaction>
                            )}
                            {currentValue.map(item => (
                                <FormFieldTransaction
                                    key={item.id}
                                    item={item}
                                    active={active}
                                    onChange={onChangeTransaction}
                                    onRemove={onRemoveTransaction}
                                >
                                    {create && (
                                        <span>
                                            <Button onClick={() => onRemoveTransaction(item.id)}>
                                                &minus;
                                            </Button>
                                        </span>
                                    )}
                                </FormFieldTransaction>
                            ))}
                        </Styled.TransactionsList>
                    </Styled.ModalInner>
                </Styled.TransactionsModal>
            )}
        </Wrapper>
    );
}

FormFieldTransactions.propTypes = {
    create: PropTypes.bool,
    value: transactionsListShape,
    active: PropTypes.bool,
    invalid: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
};

FormFieldTransactions.defaultProps = {
    create: false,
    invalid: false,
    value: [],
};

export default FormFieldTransactions;
