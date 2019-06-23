import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import FormFieldDate from './date';
import FormFieldNumber from './number';
import FormFieldCost from './cost';
import { transactionShape, transactionsListShape, modifyTransactionById } from '~client/modules/data';

function FormFieldTransactionsItem({ item, onChange }) {
    const onChangeDate = useMemo(() => onChange('date'), [onChange]);
    const onChangeUnits = useMemo(() => onChange('units'), [onChange]);
    const onChangeCost = useMemo(() => onChange('cost'), [onChange]);

    return (
        <li>
            <span className="transaction">
                <span className="row">
                    <span className="col">{'Date:'}</span>
                    <span className="col">
                        <FormFieldDate
                            value={item.date}
                            onChange={onChangeDate}
                        />
                    </span>
                </span>
                <span className="row">
                    <span className="col">{'Units:'}</span>
                    <span className="col">
                        <FormFieldNumber
                            value={item.units}
                            onChange={onChangeUnits}
                        />
                    </span>
                </span>
                <span className="row">
                    <span className="col">{'Cost:'}</span>
                    <span className="col">
                        <FormFieldCost
                            value={item.cost}
                            onChange={onChangeCost}
                        />
                    </span>
                </span>
            </span>
        </li>
    );
}

FormFieldTransactionsItem.propTypes = {
    item: transactionShape,
    onChange: PropTypes.func.isRequired
};

export default function FormFieldTransactions({ value, onChange }) {
    const makeOnChangeField = useCallback(id => field => subValue =>
        onChange(value, id, subValue, field), [onChange, value]
    );

    return (
        <ul className="form-field form-field-transactions">
            {value.map(item => (
                <FormFieldTransactionsItem key={item.id}
                    item={item}
                    onChange={makeOnChangeField(item.id)}
                />
            ))}
        </ul>
    );
}

FormFieldTransactions.propTypes = {
    value: transactionsListShape.isRequired,
    onChange: PropTypes.func.isRequired
};
