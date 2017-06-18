/**
 * Editable form element component
 */

import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { aEditableActivated, aEditableChanged } from '../../actions/EditActions';

export default class Editable extends PureControllerView {
  constructor(props) {
    super(props);
    this.inputProps = { type: 'text' };
  }
  activate() {
    this.dispatchAction(aEditableActivated(map({
      row: this.props.row,
      col: this.props.col,
      pageIndex: this.props.pageIndex,
      id: this.props.id,
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
  format() {
    return this.props.value;
  }
  getDefaultValue() {
    return this.format();
  }
  getEditValue(rawInputValue) {
    return rawInputValue;
  }
  renderValue() {
    const thisClassName = `editable editable-${this.editableType}`;
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
  pageIndex: PropTypes.number,
  id: PropTypes.number,
  item: PropTypes.string,
  value: PropTypes.string
};

