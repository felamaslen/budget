/**
 * Editable form element component
 */

import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { aEditableActivated, aEditableChanged } from '../../actions/EditActions';

export default class Editable extends PureControllerView {
  activate() {
    this.dispatchAction(aEditableActivated(map({
      row: this.props.row,
      col: this.props.col,
      page: this.props.page,
      item: this.props.item,
      value: this.props.value
    })));
  }
  componentDidUpdate(prevProps) {
    if ((!prevProps.active && this.props.active) ||
        (!prevProps.focus && this.props.focus)) {
      window.setTimeout(() => {
        this.input && this.input.focus();
      }, 0);
    }
  }
  renderValue() {
    const thisClassName = `editable-${this.editableType}`;
    return (
      <span className={thisClassName} onMouseDown={() => this.activate()}>
        {this.format()}
      </span>
    );
  }
  renderInput() {
    return (
      <input className='editable-input' {...this.inputProps}
        defaultValue={this.getDefaultValue()}
        ref={input => { this.input = input; }}
        onChange={evt => {
          this.dispatchAction(aEditableChanged(this.getEditValue(evt.target.value)));
        }}
      />
    );
  }
  render() {
    if (this.props.active) {
      return this.renderInput();
    }
    return this.renderValue();
  }
}

Editable.propTypes = {
  active: PropTypes.bool,
  row: PropTypes.number,
  col: PropTypes.number,
  page: PropTypes.string,
  item: PropTypes.string,
  value: PropTypes.string
};

