/**
 * get an editable component for use in another component
 */

import { connect } from 'react-redux';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { modifyTransactionById } from '~client/modules/data';
import FormFieldText from '~client/components/FormField';
import FormFieldDate from '~client/components/FormField/date';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldTransactions from '~client/components/FormField/transactions';

import { aFormFieldChanged } from '~client/actions/form.actions';

function FormField({ fieldKey, item, value, makeOnChange }) {
    const onChange = useMemo(() => makeOnChange(fieldKey, item), [fieldKey, item, makeOnChange]);

    if (item === 'date') {
        return (
            <FormFieldDate
                value={value}
                onChange={onChange}
            />
        );
    }

    if (item === 'cost') {
        return (
            <FormFieldCost
                value={value}
                onChange={onChange}
            />
        );
    }

    if (item === 'transactions') {
        return (
            <FormFieldTransactions
                value={value}
                onChange={onChange}
            />
        );
    }

    return (
        <FormFieldText
            value={value}
            onChange={onChange}
        />
    );
}

FormField.propTypes = {
    fieldKey: PropTypes.number.isRequired,
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    makeOnChange: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
    makeOnChange: (fieldKey, item) => {
        if (item === 'transactions') {
            return (transactionsList, id, value, subField) => {
                return dispatch(aFormFieldChanged(
                    fieldKey,
                    modifyTransactionById(transactionsList, id, {
                        [subField]: value
                    })
                ));
            };
        }

        return value => dispatch(aFormFieldChanged(fieldKey, value));
    }
});

export default connect(null, mapDispatchToProps)(FormField);
