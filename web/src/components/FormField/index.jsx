/**
 * get an editable component for use in another component
 */

import React from 'react';

import { TransactionsList } from '../../misc/data';

import FormField from './FormField';
import FormFieldDate from './FormFieldDate';
import FormFieldCost from './FormFieldCost';
import FormFieldTransactions from './FormFieldTransactions';

import { aFormFieldChanged } from '../../actions/FormActions';

export default function getFormField(dispatcher, req) {
    const onChange = value => {
        return dispatcher.dispatch(aFormFieldChanged(req.fieldKey, value));
    };

    if (req.item === 'date') {
        return <FormFieldDate dispatcher={dispatcher} onChange={onChange}
            value={req.value} />;
    }

    if (req.item === 'cost') {
        const theValue = req.value || 0;

        return <FormFieldCost dispatcher={dispatcher} onChange={onChange}
            value={theValue} />;
    }

    if (req.item === 'transactions') {
        const modifyTransactionsList = (transactionsList, value, key, trKey) => {
            if (value === null) {
                return dispatcher.dispatch(aFormFieldChanged(req.fieldKey, null));
            }

            const newList = transactionsList.list
                .setIn([key, trKey], value);

            return onChange(new TransactionsList(newList, false));
        };

        const onDateChange = (transactionsList, ymd, key) => {
            return modifyTransactionsList(transactionsList, ymd, key, 'date');
        };
        const onUnitsChange = (transactionsList, units, key) => {
            return modifyTransactionsList(transactionsList, units, key, 'units');
        };
        const onCostChange = (transactionsList, cost, key) => {
            return modifyTransactionsList(transactionsList, cost, key, 'cost');
        };

        return <FormFieldTransactions dispatcher={dispatcher} value={req.value}
            onChange={onChange}
            onDateChange={onDateChange}
            onUnitsChange={onUnitsChange}
            onCostChange={onCostChange} />;
    }

    return <FormField dispatcher={dispatcher} onChange={onChange}
        value={req.value} />;
}

