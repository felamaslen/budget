import React from 'react';
import PropTypes from 'prop-types';

import FormFieldDate from './date';
import FormFieldNumber from './number';
import FormFieldCost from './cost';
import { TransactionsList } from '../../helpers/data';

export default function FormFieldTransactions({ value, onDateChange, onUnitsChange, onCostChange }) {
    const transactionsList = value.list.map((item, key) => {
        const dateValue = item.get('date');
        const dateChange = ymd => onDateChange(value, ymd, key);

        const unitsValue = item.get('units');
        const unitsChange = units => onUnitsChange(value, units, key);

        const costValue = item.get('cost');
        const costChange = cost => onCostChange(value, cost, key);

        return <li key={key}>
            <span className="transaction">
                <span className="row">
                    <span className="col">{'Date:'}</span>
                    <span className="col">
                        <FormFieldDate value={dateValue} onChange={dateChange} />
                    </span>
                </span>
                <span className="row">
                    <span className="col">{'Units:'}</span>
                    <span className="col">
                        <FormFieldNumber value={unitsValue} onChange={unitsChange} />
                    </span>
                </span>
                <span className="row">
                    <span className="col">{'Cost:'}</span>
                    <span className="col">
                        <FormFieldCost value={costValue} onChange={costChange} />
                    </span>
                </span>
            </span>
        </li>;
    });

    return <ul className="transactions-list">
        {transactionsList}
    </ul>;
}

FormFieldTransactions.propTypes = {
    value: PropTypes.instanceOf(TransactionsList).isRequired,
    onDateChange: PropTypes.func.isRequired,
    onUnitsChange: PropTypes.func.isRequired,
    onCostChange: PropTypes.func.isRequired
};

