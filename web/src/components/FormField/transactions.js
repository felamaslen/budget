import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DateTime } from 'luxon';

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

function FormFieldTransactionsItem({ item, children, onChange, active }) {
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
                            active={active}
                        />
                    </span>
                </span>
                <span className="row">
                    <span className="col label">{'Units:'}</span>
                    <span className="col">
                        <FormFieldNumber
                            value={item.units}
                            onChange={onChangeUnits}
                            active={active}
                        />
                    </span>
                </span>
                <span className="row">
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
            </span>
        </li>
    );
}

FormFieldTransactionsItem.propTypes = {
    item: transactionShape,
    children: PropTypes.node,
    active: PropTypes.bool,
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

function FormFieldTransactionsList({ create, value, onChange, active }) {
    const makeOnChangeField = useCallback(id => field => fieldValue => onChange(modifyTransactionById(value, id, {
        [field]: fieldValue
    })), [value, onChange]);

    const makeOnRemove = useCallback(
        id => () => onChange(value.filter(({ id: valueId }) => valueId !== id)),
        [value, onChange]
    );

    return (
        <ul className="transactions-list">
            {create && <AddNewTransaction value={value} onChange={onChange} />}
            {value.map(item => (
                <FormFieldTransactionsItem key={item.id}
                    item={item}
                    active={active}
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

FormFieldTransactionsList.propTypes = {
    create: PropTypes.bool,
    value: transactionsListShape.isRequired,
    active: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};

FormFieldTransactionsList.defaultProps = {
    create: false
};

const FormFieldTransactions = ({ create, value, active, onChange }) => (
    <Wrapper item="transactions" value={value} active={active}>
        <span className="num-transactions">{(value || []).length}</span>
        {value && active && <div className="modal">
            <div className="inner">
                <FormFieldTransactionsList
                    create={create}
                    value={value}
                    active={active}
                    onChange={onChange}
                />
            </div>
        </div>}
    </Wrapper>
);

FormFieldTransactions.propTypes = {
    ...FormFieldTransactionsList.propTypes,
    value: transactionsListShape
};

FormFieldTransactions.defaultProps = {
    value: []
};

export default FormFieldTransactions;
