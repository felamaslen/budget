import { Map as map } from 'immutable';
import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatValue } from '../format';
import { dateInput } from '~client/helpers/date';
import { TransactionsList } from '~client/helpers/data';

const InputDate = React.forwardRef((props, ref) => (
    <input ref={ref} {...props} />
));

const InputUnits = React.forwardRef((props, ref) => (
    <input ref={ref} {...props} type="number" />
));

const InputCost = React.forwardRef((props, ref) => (
    <input ref={ref} {...props} type="number" step="0.01" />
));

function InteractiveEditableTransactionsItem({ transaction, onEdit, onRemove }) {
    const inputDate = useRef(null);
    const inputUnits = useRef(null);
    const inputCost = useRef(null);

    const editIfValid = useCallback((column, input, value, isValid, format) => {
        let toFormat = transaction.get(column);

        if (isValid) {
            onEdit(transaction, column, value);
            toFormat = value;
        }

        if (format) {
            toFormat = format(toFormat);
        } else {
            toFormat = formatValue(column, toFormat);
        }

        input.current.value = toFormat;
    });

    const onDateBlur = useCallback(evt => {
        const rawValue = evt.target.value;
        const value = dateInput(rawValue);

        editIfValid('date', inputDate, value, Boolean(value));
    });

    const onUnitsBlur = useCallback(evt => {
        const units = Number(evt.target.value);

        editIfValid('units', inputUnits, units, !isNaN(units));
    });

    const onCostBlur = useCallback(evt => {
        const cost = Math.round(100 * Number(evt.target.value));

        editIfValid('cost', inputCost, cost, !isNaN(cost), value => value / 100);
    });

    const date = transaction.get('date');
    const units = transaction.get('units');
    const cost = transaction.get('cost');

    return (
        <tr>
            <td>
                <InputDate ref={inputDate}
                    defaultValue={formatValue('date', date)}
                    onBlur={onDateBlur}
                />
            </td>
            <td>
                <InputUnits ref={inputUnits}
                    defaultValue={units}
                    onBlur={onUnitsBlur}
                />
            </td>
            <td>
                <InputCost ref={inputCost}
                    defaultValue={cost / 100}
                    onBlur={onCostBlur}
                />
            </td>
            <td>
                <button onClick={onRemove(transaction)}>&minus;</button>
            </td>
        </tr>
    );
}

InteractiveEditableTransactionsItem.propTypes = {
    transaction: PropTypes.instanceOf(map).isRequired,
    onEdit: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};

export default function InteractiveEditableTransactions({
    item,
    value,
    row,
    col,
    addTransaction,
    editTransaction,
    removeTransaction
}) {
    const inputDateNew = useRef(null);
    const inputUnitsNew = useRef(null);
    const inputCostNew = useRef(null);

    const onDateBlur = useCallback(evt => {
        const rawValue = evt.target.value;
        const newValue = dateInput(rawValue);

        if (newValue) {
            inputDateNew.current.value = formatValue('date', newValue);
        } else {
            inputDateNew.current.value = '';
        }
    }, [inputDateNew]);

    const onAddTransaction = useCallback(() => {
        const date = dateInput(inputDateNew.current.value);
        const units = Number(inputUnitsNew.current.value);
        const cost = Math.round(100 * Number(inputCostNew.current.value));

        if (!date || isNaN(units) || isNaN(cost)) {
            return;
        }

        addTransaction({ row, col, date, units, cost });

        inputDateNew.current.value = '';
        inputUnitsNew.current.value = '';
        inputCostNew.current.value = '';

    }, [row, col, addTransaction]);

    const getKey = useCallback(transaction => value.list.findIndex(otherItem =>
        otherItem.get('id') === transaction.get('id')
    ));

    const onEdit = useCallback((transaction, column, newValue) => {
        const key = getKey(transaction);
        editTransaction({ row, col, key, column, value: newValue });

    });

    const onRemove = useCallback(transaction => () => {
        const key = getKey(transaction);
        removeTransaction({ row, col, key });

    });

    const editList = value.list.map(transaction => (
        <InteractiveEditableTransactionsItem key={transaction.get('id')}
            transaction={transaction}
            onEdit={onEdit}
            onRemove={onRemove}
        />
    ));

    const className = classNames('active', 'editable', 'editable-transactions');

    return (
        <span className={className}>
            <span className="num-transactions">
                {formatValue(item, value)}
            </span>
            <div className="modal">
                <div className="inner">
                    <table>
                        <thead>
                            <tr>
                                <th>{'Date'}</th>
                                <th>{'Units'}</th>
                                <th colSpan="2">{'Cost'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <InputDate ref={inputDateNew}
                                        onBlur={onDateBlur}
                                    />
                                </td>
                                <td>
                                    <InputUnits ref={inputUnitsNew} />
                                </td>
                                <td>
                                    <InputCost ref={inputCostNew} />
                                </td>
                                <td>
                                    <button onClick={onAddTransaction}>{'+'}</button>
                                </td>
                            </tr>
                            {editList}
                        </tbody>
                    </table>
                </div>
            </div>
        </span>
    );
}

InteractiveEditableTransactions.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.instanceOf(TransactionsList).isRequired,
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    addTransaction: PropTypes.func.isRequired,
    editTransaction: PropTypes.func.isRequired,
    removeTransaction: PropTypes.func.isRequired
};

