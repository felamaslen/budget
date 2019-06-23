import React from 'react';
import PropTypes from 'prop-types';
import InteractiveEditable from './interactive-editable';
import InteractiveEditableTransactions from './interactive-editable/transactions';

export default function EditableActive(props) {
    const { item } = props;

    if (item === 'transactions') {
        return <InteractiveEditableTransactions {...props} />;
    }

    return <InteractiveEditable {...props} />;
}

EditableActive.propTypes = {
    item: PropTypes.string.isRequired
};
