/**
 * get an editable component for use in another component
 */

import { connect } from 'react-redux';

import React from 'react';

import { TransactionsList } from '../../misc/data';

import FormField from './FormField';
import FormFieldDate from './FormFieldDate';
import FormFieldCost from './FormFieldCost';
import FormFieldTransactions from './FormFieldTransactions';

import { aFormFieldChanged } from '../../actions/FormActions';

function getFormFieldComponent(item, value) {
    if (item === 'date') {
        return <FormFieldDate value={value} />;
    }

    if (item === 'cost') {
        const theValue = value || 0;

        return <FormFieldCost value={theValue} />;
    }

    if (item === 'transactions') {


        return <FormFieldTransactions value={value} />;
    }

    return <FormField value={value} />;
}

function getDispatchMapping(fieldKey, item) {
    const onChange = (dispatch, fieldValue) => {
        return dispatch(aFormFieldChanged(fieldKey, fieldValue));
    };

    if (item === 'transactions') {
        const modifyTransactionsList = (dispatch, transactionsList, value, key, trKey) => {
            if (value === null) {
                return dispatch(aFormFieldChanged(fieldKey, null));
            }

            const newList = transactionsList.list
                .setIn([key, trKey], value);

            return onChange(dispatch, new TransactionsList(newList, false));
        };

        return dispatch => ({
            onDateChange: (transactionsList, ymd, key) => {
                return modifyTransactionsList(dispatch, transactionsList, ymd, key, 'date');
            },
            onUnitsChange: (transactionsList, units, key) => {
                return modifyTransactionsList(dispatch, transactionsList, units, key, 'units');
            },
            onCostChange: (transactionsList, cost, key) => {
                return modifyTransactionsList(dispatch, transactionsList, cost, key, 'cost');
            }
        });
    }

    return dispatch => ({
        onChange: fieldValue => onChange(dispatch, fieldValue)
    });
}

export default ({ fieldKey, item, value }) => {
    const Component = getFormFieldComponent(item, value);

    const mapStateToProps = () => ({});

    const mapDispatchToProps = getDispatchMapping(fieldKey, item);

    return connect(mapStateToProps, mapDispatchToProps)(Component);
}

