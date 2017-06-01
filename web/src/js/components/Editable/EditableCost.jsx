/**
 * Editable form element component - currency
 */

import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import Editable from './Editable';
import { aEditableActivated, aEditableChanged } from '../../actions/EditActions';
import { formatCurrency } from '../../misc/format';

export class EditableCost extends Editable {
  editChange(value) {
    this.dispatchAction(aEditableChanged(Math.round(parseFloat(value, 10) * 100)));
  }
  activate() {
    this.dispatchAction(aEditableActivated(map({
      row: this.props.row,
      col: this.props.col,
      page: this.props.page,
      item: this.props.item,
      value: this.props.value
    })));
  }
  format() {
    // format the current value
    return formatCurrency(this.props.value);
  }
  render() {
    if (this.props.active) {
      return (
        <input className='editable-input' type='number' step='0.01'
          defaultValue={this.props.value / 100}
          ref={input => {
            this.input = input;
          }}
          onChange={evt => this.editChange(evt.target.value)} />
      );
    }
    return (
      <span className='editable-cost' onMouseDown={() => this.activate()}>
        {this.format()}
      </span>
    );
  }
}

EditableCost.propTypes = {
  value: PropTypes.number
};

