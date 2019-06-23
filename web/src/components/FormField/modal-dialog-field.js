import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import FormField from '~client/containers/FormField';

export default function ModalDialogField({ field: { item, value }, fieldKey, invalidKeys }) {
    const invalid = invalidKeys.includes(fieldKey);

    const formField = (
        <FormField
            fieldKey={fieldKey}
            item={item}
            value={value}
        />
    );

    const className = classNames('form-row', item, { invalid });

    if (item === 'transactions') {
        return (
            <li className={className}>
                <div className="inner">
                    <span className="form-label">{item}</span>
                    {formField}
                </div>
            </li>
        );
    }

    return (
        <li className={className}>
            <span className="form-label">{item}</span>
            {formField}
        </li>
    );
}

ModalDialogField.propTypes = {
    fieldKey: PropTypes.number.isRequired,
    field: PropTypes.shape({
        item: PropTypes.string.isRequired,
        value: PropTypes.any
    }).isRequired,
    invalidKeys: PropTypes.arrayOf(PropTypes.number.isRequired)
};
