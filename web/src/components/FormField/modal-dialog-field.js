import { Map as map, List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import FormField from '~client/containers/FormField';

export default function ModalDialogField({ field, fieldKey, invalidKeys }) {
    const invalid = invalidKeys.includes(fieldKey);

    const formField = (
        <FormField
            fieldKey={fieldKey}
            item={field.get('item')}
            value={field.get('value')}
        />
    );

    const className = classNames('form-row', field.get('item'), { invalid });

    if (field.get('item') === 'transactions') {
        return (
            <li className={className}>
                <div className="inner">
                    <span className="form-label">{field.get('item')}</span>
                    {formField}
                </div>
            </li>
        );
    }

    return (
        <li className={className}>
            <span className="form-label">{field.get('item')}</span>
            {formField}
        </li>
    );
}

ModalDialogField.propTypes = {
    fieldKey: PropTypes.number.isRequired,
    field: PropTypes.instanceOf(map).isRequired,
    invalidKeys: PropTypes.instanceOf(list)
};

