import React, { useCallback } from 'react';
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
    children: PropTypes.node.isRequired,
};

export default function ModalDialogField({
    item, value, invalid, onChange,
}) {
    const className = classNames('form-row', item, { invalid });
    const onChangeCallback = useCallback((newValue) => onChange(item, newValue), [onChange, item]);

    if (item === 'date') {
        return (
            <FormFieldContainer item={item} className={className}>
                <FormFieldDate
                    value={value}
                    onChange={onChangeCallback}
                />
            </FormFieldContainer>
        );
    }
    if (item === 'cost') {
        return (
            <FormFieldContainer item={item} className={className}>
                <FormFieldCost
                    value={value}
                    onChange={onChangeCallback}
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
                        onChange={onChangeCallback}
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
                onChange={onChangeCallback}
            />
        </FormFieldContainer>
    );
}

ModalDialogField.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.any,
    invalid: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};
