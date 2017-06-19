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
  format() {
    const row = this.props.row;
    const col = this.props.col;

    const modal = this.props.active ? (
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
                <button onClick={() => {
                  const date = new YMD(this.inputAdd.date.value);
                  const units = parseFloat(this.inputAdd.units.value, 10);
                  const cost = Math.round(100 * parseFloat(this.inputAdd.cost.value, 10));
                  if (!date.valid || isNaN(units) || isNaN(cost)) {
                    return;
                  }
                  this.dispatchAction(
                    aFundTransactionsAdded({ row, col, date, units, cost }));
                  this.inputAdd.date.value = '';
                  this.inputAdd.units.value = '';
                  this.inputAdd.cost.value = '';
                }}>+</button>
              </td>
            </tr>
            {this.props.value.list.map((transaction, key) => {
              const date = transaction.get('date');
              const units = transaction.get('units');
              const cost = transaction.get('cost');

              const id = transaction.get('id');

              return (
                <tr key={id}>
                  <td>
                    <input defaultValue={date.format()}
                      ref={input => { this.input.date[id] = input; }}
                      onBlur={() => {
                        this.input.date[id].value = this.props.value.list.getIn([key, 'date']).format();
                      }}
                      onChange={evt => {
                        const value = new YMD(evt.target.value);
                        if (value.valid) {
                          this.dispatchAction(
                            aFundTransactionsChanged({ row, col, key, column: 'date', value }));
                        }
                      }}
                    />
                  </td>
                  <td>
                    <input defaultValue={units}
                      ref={input => { this.input.units[id] = input; }}
                      onBlur={() => {
                        this.input.units[id].value = this.props.value.list.getIn([key, 'units']);
                      }}
                      onChange={evt => {
                        const thisUnits = parseFloat(evt.target.value, 10);
                        const value = isNaN(thisUnits) ? units : thisUnits;
                        this.dispatchAction(
                          aFundTransactionsChanged({ row, col, key, column: 'units', value }));
                      }}
                    />
                  </td>
                  <td>
                    <input defaultValue={cost / 100}
                      ref={input => { this.input.cost[id] = input; }}
                      onBlur={() => {
                        this.input.cost[id].value = this.props.value.list.getIn([key, 'cost']) / 100;
                      }}
                      onChange={evt => {
                        const thisCost = Math.round(100 * parseFloat(evt.target.value, 10));
                        const value = isNaN(thisCost) ? cost : thisCost;
                        this.dispatchAction(
                          aFundTransactionsChanged({ row, col, key, column: 'cost', value }));
                      }}
                    />
                  </td>
                  <td>
                    <button onClick={() => {
                      this.dispatchAction(
                        aFundTransactionsRemoved({ row, col, key }));
                    }}>-</button>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    ) : null;

    const size = this.props.value && this.props.value.size ? this.props.value.size : 0;

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

