import React from 'react';
import PureComponent from '../../../immutable-component';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DATE_FORMAT_DISPLAY } from '../../../misc/config';
import { dateInput } from '../../../misc/date';
import { formatValue } from '../format';

export default class InteractiveEditableTransactions extends PureComponent {
    constructor(props) {
        super(props);

        this.input = {
            date: {},
            units: {},
            cost: {}
        };

        this.inputAdd = {};
    }
    addTransaction(row, col) {
        const date = dateInput(this.inputAdd.date.value);
        const units = Number(this.inputAdd.units.value);
        const cost = Math.round(100 * Number(this.inputAdd.cost.value));

        if (!date || isNaN(units) || isNaN(cost)) {
            return;
        }

        this.props.addTransaction({ row, col, date, units, cost });

        this.inputAdd.date.value = '';
        this.inputAdd.units.value = '';
        this.inputAdd.cost.value = '';
    }
    onDateBlur(key, id) {
        this.input.date[id].value = this.props.value.list
            .getIn([key, 'date'])
            .format(DATE_FORMAT_DISPLAY);
    }
    onDateChange(row, col, key, rawValue) {
        const value = dateInput(rawValue);

        if (value) {
            this.props.editTransaction({ row, col, key, column: 'date', value });
        }
    }
    onUnitsBlur(key, id) {
        this.input.units[id].value = this.props.value.list.getIn([key, 'units']);
    }
    onUnitsChange(row, col, key, newUnits, units) {
        const thisUnits = Number(newUnits);

        const value = isNaN(thisUnits)
            ? units
            : thisUnits;

        this.props.editTransaction({
            row, col, key, column: 'units', value
        });
    }
    onCostBlur(key, id) {
        this.input.cost[id].value = this.props.value.list.getIn([key, 'cost']) / 100;
    }
    onCostChange(row, col, key, newCost, cost) {
        const thisCost = Math.round(100 * Number(newCost));

        const value = isNaN(thisCost)
            ? cost
            : thisCost;

        this.props.editTransaction({
            row, col, key, column: 'cost', value
        });
    }
    render() {
        const { item, value, row, col } = this.props;

        const addDateRef = input => {
            this.inputAdd.date = input;
        };
        const addUnitsRef = input => {
            this.inputAdd.units = input;
        };
        const addCostRef = input => {
            this.inputAdd.cost = input;
        };

        const addOnClick = () => this.addTransaction(row, col);

        const editList = value.list.map((transaction, key) => {
            const date = transaction.get('date');
            const units = transaction.get('units');
            const cost = transaction.get('cost');

            const id = transaction.get('id');

            const onDateChange = evt => this.onDateChange(
                row, col, key, evt.target.value
            );

            const onUnitsChange = evt => this.onUnitsChange(
                row, col, key, evt.target.value, units
            );

            const onCostChange = evt => this.onCostChange(
                row, col, key, evt.target.value, cost
            );

            const removeOnClick = () => this.props.removeTransaction({ row, col, key });

            const dateRef = input => {
                this.input.date[id] = input;
            };
            const unitsRef = input => {
                this.input.units[id] = input;
            };
            const costRef = input => {
                this.input.cost[id] = input;
            };

            return <tr key={id}>
                <td>
                    <input defaultValue={date.format(DATE_FORMAT_DISPLAY)} ref={dateRef}
                        onBlur={onDateChange}
                    />
                </td>
                <td>
                    <input defaultValue={units} ref={unitsRef}
                        onBlur={onUnitsChange}
                    />
                </td>
                <td>
                    <input defaultValue={cost / 100} ref={costRef}
                        onBlur={onCostChange}
                    />
                </td>
                <td>
                    <button onClick={removeOnClick}>&minus;</button>
                </td>
            </tr>;
        });

        const className = classNames('active', 'editable', 'editable-transactions');

        return <span className={className}>
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
                                <td><input ref={addDateRef} /></td>
                                <td><input ref={addUnitsRef} /></td>
                                <td><input ref={addCostRef} /></td>
                                <td>
                                    <button onClick={addOnClick}>{'+'}</button>
                                </td>
                            </tr>
                            {editList}
                        </tbody>
                    </table>
                </div>
            </div>;
        </span>;
    }
}

InteractiveEditableTransactions.propTypes = {
    item: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired,
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    addTransaction: PropTypes.func.isRequired,
    editTransaction: PropTypes.func.isRequired,
    removeTransaction: PropTypes.func.isRequired
};

