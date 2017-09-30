/**
 * get an editable component for use in another component
 */

import { connect } from 'react-redux';

import { TransactionsList } from '../../misc/data';

import FormField from './FormField';
import FormFieldDate from './FormFieldDate';
import FormFieldCost from './FormFieldCost';
import FormFieldTransactions from './FormFieldTransactions';

import { aFormFieldChanged } from '../../actions/FormActions';

function getFormFieldComponent(item) {
    if (item === 'date') {
        return FormFieldDate;
    }

    if (item === 'cost') {
        return FormFieldCost;
    }

    if (item === 'transactions') {
        return FormFieldTransactions;
    }

    return FormField;
}

function getStateProps(item, defaultValue) {
    const value = item === 'cost'
        ? (defaultValue || 0)
        : defaultValue;

    return () => ({ value });
}

function getDispatchProps(fieldKey, item) {
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
    const Component = getFormFieldComponent(item);

    const mapStateToProps = getStateProps(item, value);

    const mapDispatchToProps = getDispatchProps(fieldKey, item);

    return connect(mapStateToProps, mapDispatchToProps)(Component);
}

