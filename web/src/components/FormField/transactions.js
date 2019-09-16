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
    transactionsListShape
} from '~client/modules/data';
import { CREATE_ID } from '~client/constants/data';

function FormFieldTransaction({ item, children, onChange, active }) {
    const onChangeDate = useCallback(value => onChange(item.id, 'date', value), [onChange, item.id]);
    const onChangeUnits = useCallback(value => onChange(item.id, 'units', value), [onChange, item.id]);
    const onChangeCost = useCallback(value => onChange(item.id, 'cost', value), [onChange, item.id]);

    return (
        <li className="transactions-list-item">
            <span className="row date">
                <span className="col label">{'Date:'}</span>
                <span className="col">
                    <FormFieldDate
                        value={item.date}
                        onChange={onChangeDate}
                        active={active}
                    />
                </span>
            </span>
            <span className="row units">
                <span className="col label">{'Units:'}</span>
                <span className="col">
                    <FormFieldNumber
                        value={item.units}
                        onChange={onChangeUnits}
                        active={active}
                    />
                </span>
            </span>
            <span className="row cost">
                <span className="col label">{'Cost:'}</span>
                <span className="col">
                    <FormFieldCost
                        value={item.cost}
                        onChange={onChangeCost}
                        active={active}
                    />
                </span>
            </span>
            {children}
        </li>
    );
}

FormFieldTransaction.propTypes = {
    item: transactionShape,
    children: PropTypes.node,
    onChange: PropTypes.func.isRequired,
    active: PropTypes.bool
};

const newItemInit = {
    id: CREATE_ID,
    date: DateTime.local(),
    units: 0,
    cost: 0
};

function FormFieldTransactions({ create, ...props }) {
    const [currentValue, , onChangeInput] = useField({ ...props, string: true });

    const onChange = useCallback(value => onChangeInput({
        target: { value }
    }), [onChangeInput]);

    const { value, active } = props;

    const onChangeTransaction = useCallback((id, field, fieldValue) =>
        onChange(modifyTransactionById(currentValue, id, {
            [field]: fieldValue
        })), [currentValue, onChange]);

    const onRemoveTransaction = useCallback(id => onChange(
        currentValue.filter(({ id: valueId }) => valueId !== id)
    ), [currentValue, onChange]);

    const [newItem, setNewItem] = useState(newItemInit);

    const onChangeAddField = useCallback((id, field, fieldValue) => setNewItem(last => ({
        ...last,
        [field]: fieldValue
    })), []);

    const onAdd = useCallback(() => {
        if (!newItem) {
            return;
        }

        setNewItem(newItemInit);
        onChange(addToTransactionsList(currentValue, newItem));
    }, [newItem, currentValue, onChange]);

    return (
        <Wrapper item="transactions" value={value} active={active}>
            <span className="num-transactions">{(value || []).length}</span>
            {currentValue && active && <div className="modal">
                <div className="modal-inner">
                    {create && (
                        <div className="modal-head">
                            <span className="col label date">{'Date'}</span>
                            <span className="col label units">{'Units'}</span>
                            <span className="col label cost">{'Cost'}</span>
                        </div>
                    )}
                    <ul className="transactions-list">
                        {create && (
                            <FormFieldTransaction
                                item={newItem}
                                onChange={onChangeAddField}
                            >
                                <span className="row button">
                                    <button onClick={onAdd}>{'+'}</button>
                                </span>
                            </FormFieldTransaction>
                        )}
                        {currentValue.map(item => (
                            <FormFieldTransaction key={item.id}
                                item={item}
                                active={active}
                                onChange={onChangeTransaction}
                                onRemove={onRemoveTransaction}
                            >
                                {create && <span className="row button">
                                    <button onClick={() => onRemoveTransaction(item.id)}>
                                        &minus;
                                    </button>
                                </span>}
                            </FormFieldTransaction>
                        ))}
                    </ul>
                </div>
            </div>}
        </Wrapper>
    );
}

FormFieldTransactions.propTypes = {
    create: PropTypes.bool,
    value: transactionsListShape,
    active: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};

FormFieldTransactions.defaultProps = {
    create: false,
    value: []
};

export default FormFieldTransactions;
