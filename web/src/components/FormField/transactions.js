import { Map as map } from 'immutable';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import FormFieldDate from './date';
import FormFieldNumber from './number';
import FormFieldCost from './cost';
import { TransactionsList } from '~client/modules/data';

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
                            value={item.get('date')}
                            onChange={onChangeDate}
                        />
                    </span>
                </span>
                <span className="row">
                    <span className="col">{'Units:'}</span>
                    <span className="col">
                        <FormFieldNumber
                            value={item.get('units')}
                            onChange={onChangeUnits}
                        />
                    </span>
                </span>
                <span className="row">
                    <span className="col">{'Cost:'}</span>
                    <span className="col">
                        <FormFieldCost
                            value={item.get('cost')}
                            onChange={onChangeCost}
                        />
                    </span>
                </span>
            </span>
        </li>
    );
}

FormFieldTransactionsItem.propTypes = {
    item: PropTypes.instanceOf(map).isRequired,
    onChange: PropTypes.func.isRequired
};

export default function FormFieldTransactions({ value, onChange }) {
    const makeOnChangeField = useCallback(key => field => subValue =>
        onChange(value.list, key, subValue, field), [onChange, value.list]
    );

    return (
        <ul className="transactions-list">
            {value.list.map((item, key) => (
                <FormFieldTransactionsItem key={key}
                    item={item}
                    onChange={makeOnChangeField(key)}
                />
            ))}
        </ul>
    );
}

FormFieldTransactions.propTypes = {
    value: PropTypes.instanceOf(TransactionsList).isRequired,
    onChange: PropTypes.func.isRequired
};
