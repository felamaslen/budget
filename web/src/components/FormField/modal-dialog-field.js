import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import FormFieldText from '~client/components/FormField';
import FormFieldDate from '~client/components/FormField/date';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldTransactions from '~client/components/FormField/transactions';

const FormFieldContainer = ({ children, item, className }) => (
    <li className={className}>
        <span className="form-label">{item}</span>
        {children}
    </li>
);

FormFieldContainer.propTypes = {
    item: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
};

export default function ModalDialogField({ field: { item, value }, fieldKey, invalidKeys, onChange }) {
    const invalid = invalidKeys.includes(fieldKey);

    const className = classNames('form-row', item, { invalid });

    if (item === 'date') {
        return (
            <FormFieldContainer item={item} className={className}>
                <FormFieldDate
                    value={value}
                    onChange={onChange}
                />
            </FormFieldContainer>
        );
    }
    if (item === 'cost') {
        return (
            <FormFieldContainer item={item} className={className}>
                <FormFieldCost
                    value={value}
                    onChange={onChange}
                />
            </FormFieldContainer>
        );
    }
    if (item === 'transactions') {
        return (
            <li className={className}>
                <div className="inner">
                    <span className="form-label">{item}</span>
                    <FormFieldTransactions
                        value={value}
                        onChange={onChange}
                        active
                    />
                </div>
            </li>
        );
    }

    return (
        <FormFieldContainer item={item} className={className}>
            <FormFieldText
                value={value}
                onChange={onChange}
            />
        </FormFieldContainer>
    );
}

ModalDialogField.propTypes = {
    fieldKey: PropTypes.number.isRequired,
    field: PropTypes.shape({
        item: PropTypes.string.isRequired,
        value: PropTypes.any
    }).isRequired,
    invalidKeys: PropTypes.arrayOf(PropTypes.number.isRequired),
    onChange: PropTypes.func.isRequired
};
