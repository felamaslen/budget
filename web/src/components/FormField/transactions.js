import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import FormFieldDate from './date';
import FormFieldNumber from './number';
import FormFieldCost from './cost';
import {
    addToTransactionsList,
    modifyTransactionById,
    transactionShape,
    transactionsListShape
} from '~client/modules/data';
import { CREATE_ID } from '~client/components/CrudList';

function FormFieldTransactionsItem({ item, children, onChange }) {
    const onChangeDate = useMemo(() => onChange('date'), [onChange]);
    const onChangeUnits = useMemo(() => onChange('units'), [onChange]);
    const onChangeCost = useMemo(() => onChange('cost'), [onChange]);

    return (
        <li>
            <span className="transaction">
                <span className="row">
                    <span className="col label">{'Date:'}</span>
                    <span className="col">
                        <FormFieldDate
                            value={item.date}
                            onChange={onChangeDate}
                        />
                    </span>
                </span>
                <span className="row">
                    <span className="col label">{'Units:'}</span>
                    <span className="col">
                        <FormFieldNumber
                            value={item.units}
                            onChange={onChangeUnits}
                        />
                    </span>
                </span>
                <span className="row">
                    <span className="col label">{'Cost:'}</span>
                    <span className="col">
                        <FormFieldCost
                            value={item.cost}
                            onChange={onChangeCost}
                        />
                    </span>
                </span>
                {children}
            </span>
        </li>
    );
}

FormFieldTransactionsItem.propTypes = {
    item: transactionShape,
    children: PropTypes.node,
    onChange: PropTypes.func.isRequired
};

function AddNewTransaction({ value, onChange }) {
    const onAdd = useCallback(newItem => onChange(addToTransactionsList(value, newItem)), [value, onChange]);
    const [newItem, setNewItem] = useState({
        id: CREATE_ID,
        date: DateTime.local(),
        units: 0,
        cost: 0
    });

    const onAddCallback = useCallback(() => {
        if (!newItem) {
            return;
        }

        onAdd(newItem);
    }, [newItem, onAdd]);

    const onChangeField = useCallback(field => fieldValue => setNewItem({
        ...newItem,
        [field]: fieldValue
    }), [newItem]);

    return (
        <FormFieldTransactionsItem
            item={newItem}
            onChange={onChangeField}
        >
            <span className="row">
                <button onClick={onAddCallback}>{'+'}</button>
            </span>
        </FormFieldTransactionsItem>
    );
}

AddNewTransaction.propTypes = {
    value: transactionsListShape.isRequired,
    onChange: PropTypes.func.isRequired
};

export default function FormFieldTransactions({ create, value, onChange }) {
    const makeOnChangeField = useCallback(id => field => fieldValue => onChange(modifyTransactionById(value, id, {
        [field]: fieldValue
    })), [value, onChange]);

    const makeOnRemove = useCallback(
        id => () => onChange(value.filter(({ id: valueId }) => valueId !== id)),
        [value, onChange]
    );

    return (
        <ul className="form-field form-field-transactions">
            {create && <AddNewTransaction value={value} onChange={onChange} />}
            {value.map(item => (
                <FormFieldTransactionsItem key={item.id}
                    item={item}
                    onChange={makeOnChangeField(item.id)}
                >
                    {create && <span className="row">
                        <button onClick={makeOnRemove(item.id)}>&minus;</button>
                    </span>}
                </FormFieldTransactionsItem>
            ))}
        </ul>
    );
}

FormFieldTransactions.propTypes = {
    create: PropTypes.bool,
    value: transactionsListShape.isRequired,
    onChange: PropTypes.func.isRequired
};

FormFieldTransactions.defaultProps = {
    create: false
};
