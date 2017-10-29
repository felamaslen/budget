import { Map as map, List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import getFormField from '../../containers/form-field';

export default function ModalDialogField({ field, fieldKey, invalidKeys }) {
    const FieldContainer = getFormField({
        fieldKey,
        item: field.get('item'),
        value: field.get('value')
    });

    const invalid = invalidKeys.includes(fieldKey);

    const className = classNames({
        'form-row': true,
        [field.get('item')]: true,
        invalid
    });

    if (field.get('item') === 'transactions') {
        return <li className={className}>
            <div className="inner">
                <span className="form-label">{field.get('item')}</span>
                <FieldContainer />
            </div>
        </li>;
    }

    return <li className={className}>
        <span className="form-label">{field.get('item')}</span>
        <FieldContainer />
    </li>;
}

ModalDialogField.propTypes = {
    fieldKey: PropTypes.number.isRequired,
    field: PropTypes.instanceOf(map).isRequired,
    invalidKeys: PropTypes.instanceOf(list)
};

