/**
 * Editable form element component - fund transactions lists
 */

import React from 'react';
import PropTypes from 'prop-types';
import Editable from './Editable';
import { YMD } from '../../misc/date';
import { TransactionsList } from '../../misc/data';
import {
    aFundTransactionsChanged, aFundTransactionsAdded, aFundTransactionsRemoved
} from '../../actions/EditActions';

export default class EditableTransactions extends Editable {
    constructor(props) {
        super(props);
        this.editableType = 'transactions';
        this.resetInputs();
    }
    resetInputs() {
        this.input = {
            date: {},
            units: {},
            cost: {}
        };
        this.inputAdd = {};
    }
    addTransaction(row, col) {
        const date = new YMD(this.inputAdd.date.value);
        const units = parseFloat(this.inputAdd.units.value, 10);
        const cost = Math.round(100 * parseFloat(this.inputAdd.cost.value, 10));

        if (!date.valid || isNaN(units) || isNaN(cost)) {
            return;
        }

        this.dispatchAction(aFundTransactionsAdded(
            { row, col, date, units, cost }
        ));
        this.inputAdd.date.value = '';
        this.inputAdd.units.value = '';
        this.inputAdd.cost.value = '';
    }
    onDateBlur(key, id) {
        this.input.date[id].value = this.props.value.list
            .getIn([key, 'date'])
            .format();
    }
    onDateChange(row, col, key, rawValue) {
        const value = new YMD(rawValue);
        if (value.valid) {
            this.dispatchAction(aFundTransactionsChanged({
                row, col, key, column: 'date', value
            }));
        }
    }
    onUnitsBlur(key, id) {
        this.input.units[id].value = this.props.value.list.getIn([key, 'units']);
    }
    onUnitsChange(row, col, key, newUnits, units) {
        const thisUnits = parseFloat(newUnits, 10);

        const value = isNaN(thisUnits)
            ? units
            : thisUnits;

        this.dispatchAction(aFundTransactionsChanged({
            row, col, key, column: 'units', value
        }));
    }
    onCostBlur(key, id) {
        this.input.cost[id].value = this.props.value.list.getIn([key, 'cost']) / 100;
    }
    onCostChange(row, col, key, newCost, cost) {
        const thisCost = Math.round(100 * parseFloat(newCost, 10));

        const value = isNaN(thisCost)
            ? cost
            : thisCost;

        this.dispatchAction(aFundTransactionsChanged(
            { row, col, key, column: 'cost', value }
        ));
    }
    getModal() {
        if (!this.props.active) {
            return null;
        }

        const row = this.props.row;
        const col = this.props.col;

        const addOnClick = () => this.addTransaction(row, col);

        const editList = this.props.value.list.map((transaction, key) => {
            const date = transaction.get('date');
            const units = transaction.get('units');
            const cost = transaction.get('cost');

            const id = transaction.get('id');

            const onDateBlur = () => this.onDateBlur(key, id);

            const onDateChange = evt => this.onDateChange(
                row, col, key, evt.target.value
            );

            const onUnitsBlur = () => this.onUnitsBlur(key, id);

            const onUnitsChange = evt => this.onUnitsChange(
                row, col, key, evt.target.value, units
            );

            const onCostBlur = () => this.onCostBlur(key, id);

            const onCostChange = evt => this.onCostChange(
                row, col, key, evt.target.value, cost
            );

            const removeOnClick = () => this.dispatchAction(
                aFundTransactionsRemoved({ row, col, key })
            );

            return (
                <tr key={id}>
                    <td>
                        <input defaultValue={date.format()}
                            ref={input => { this.input.date[id] = input; }}
                            onBlur={onDateBlur}
                            onChange={onDateChange}
                        />
                    </td>
                    <td>
                        <input defaultValue={units}
                            ref={input => { this.input.units[id] = input; }}
                            onBlur={onUnitsBlur}
                            onChange={onUnitsChange}
                        />
                    </td>
                    <td>
                        <input defaultValue={cost / 100}
                            ref={input => { this.input.cost[id] = input; }}
                            onBlur={onCostBlur}
                            onChange={onCostChange}
                        />
                    </td>
                    <td>
                        <button onClick={removeOnClick}>&minus;</button>
                    </td>
                </tr>
            );
        });

        return (
            <div className='modal'>
                <div className='inner'>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Units</th>
                                <th colSpan='2'>Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input ref={input => { this.inputAdd.date = input; }} /></td>
                                <td><input ref={input => { this.inputAdd.units = input; }} /></td>
                                <td><input ref={input => { this.inputAdd.cost = input; }} /></td>
                                <td>
                                    <button onClick={addOnClick}>+</button>
                                </td>
                            </tr>
                            {editList}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
    format() {
        const modal = this.getModal();

        const size = this.props.value && this.props.value.size
            ? this.props.value.size
            : 0;

        return (
            <span>
                <span className='num-transactions'>{size}</span>
                {modal}
            </span>
        );
    }
    render() {
        return this.renderValue();
    }
}

EditableTransactions.propTypes = {
    value: PropTypes.instanceOf(TransactionsList)
};

