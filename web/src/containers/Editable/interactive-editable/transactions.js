import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatValue } from '~client/containers/Editable/format';
import { transactionsListShape } from '~client/modules/data';
import FormFieldTransactions from '~client/components/FormField/transactions';

export default function InteractiveEditableTransactions({
    item,
    value,
    onChange
}) {
    const className = classNames('active', 'editable', 'editable-transactions');

    return (
        <span className={className}>
            <span className="num-transactions">
                {formatValue(item, value)}
            </span>
            <div className="modal">
                <div className="inner">
                    <FormFieldTransactions value={value} onChange={onChange} create />
                </div>
            </div>
        </span>
    );
}

InteractiveEditableTransactions.propTypes = {
    item: PropTypes.string.isRequired,
    value: transactionsListShape.isRequired,
    row: PropTypes.string.isRequired,
    col: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};
