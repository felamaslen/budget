import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import { useField } from '~client/hooks/field';
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
    const onChangeDate = useCallback(
        value => onChange(item.id, 'date', value),
        [onChange, item.id],
    );
    const onChangeUnits = useCallback(
        value => onChange(item.id, 'units', value),
        [onChange, item.id],
    );
    const onChangeCost = useCallback(
        value => onChange(item.id, 'cost', value),
        [onChange, item.id],
    );

    return (
        <Styled.TransactionsListItem className="transactions-list-item">
            <Styled.TransactionRowDate className="row date">
                <Styled.TransactionLabel className="col label">
                    {'Date:'}
                </Styled.TransactionLabel>
                <Styled.TransactionCol className="col">
                    <FormFieldDate
                        value={item.date}
                        onChange={onChangeDate}
                        active={active}
                    />
                </Styled.TransactionCol>
            </Styled.TransactionRowDate>
            <Styled.TransactionRowUnits className="row units">
                <Styled.TransactionLabel className="col label">
                    {'Units:'}
                </Styled.TransactionLabel>
                <Styled.TransactionCol className="col">
                    <FormFieldNumber
                        value={item.units}
                        onChange={onChangeUnits}
                        active={active}
                    />
                </Styled.TransactionCol>
            </Styled.TransactionRowUnits>
            <Styled.TransactionRowCost className="row cost">
                <Styled.TransactionLabel className="col label">
                    {'Cost:'}
                </Styled.TransactionLabel>
                <Styled.TransactionCol className="col">
                    <FormFieldCost
                        value={item.cost}
                        onChange={onChangeCost}
                        active={active}
                    />
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

function FormFieldTransactions({ create, ...props }) {
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
        id =>
            onChange(currentValue.filter(({ id: valueId }) => valueId !== id)),
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
        <Wrapper item="transactions" value={value} active={active}>
            <Styled.NumTransactions
                active={active}
                className="num-transactions"
            >
                {(value || []).length}
            </Styled.NumTransactions>
            {currentValue && active && (
                <Styled.TransactionsModal className="modal">
                    <Styled.ModalInner className="modal-inner">
                        {create && (
                            <Styled.ModalHead>
                                <Styled.ModalHeadDate className="label">
                                    {'Date'}
                                </Styled.ModalHeadDate>
                                <Styled.ModalHeadUnits className="label">
                                    {'Units'}
                                </Styled.ModalHeadUnits>
                                <Styled.ModalHeadCost className="label">
                                    {'Cost'}
                                </Styled.ModalHeadCost>
                            </Styled.ModalHead>
                        )}
                        <Styled.TransactionsList className="transactions-list">
                            {create && (
                                <FormFieldTransaction
                                    item={newItem}
                                    onChange={onChangeAddField}
                                >
                                    <Styled.TransactionRowButton className="row button">
                                        <button onClick={onAdd}>{'+'}</button>
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
                                        <span className="row button">
                                            <button
                                                onClick={() =>
                                                    onRemoveTransaction(item.id)
                                                }
                                            >
                                                &minus;
                                            </button>
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
    onChange: PropTypes.func.isRequired,
};

FormFieldTransactions.defaultProps = {
    create: false,
    value: [],
};

export default FormFieldTransactions;
