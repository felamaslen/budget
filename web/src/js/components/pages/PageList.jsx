/**
 * List page component
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { List as list, Map as map } from 'immutable';
import { LIST_COLS_PAGES } from '../../misc/const';
import { formatCurrency } from '../../misc/format';
import { getEditable } from '../../misc/data.jsx';
import { aListItemAdded } from '../../actions/EditActions';

export class PageList extends PureControllerView {
  addItem() {
    this.dispatchAction(aListItemAdded(this.addItems));
  }
  renderListHead() {
    return (
      <div className='list-head noselect'>
        {LIST_COLS_PAGES[this.props.index].map((column, key) => {
          return <span key={key} className={column}>{column}</span>;
        })}
        <span>Daily Tally</span>
        <span>Total:</span>
        <span>{formatCurrency(
          this.props.data.getIn(['data', 'total']), { abbreviate: true }
        )}</span>
      </div>
    );
  }
  renderLiAdd() {
    this.addItems = [];
    return (
      <li className='li-add'>
        {LIST_COLS_PAGES[this.props.index].map((column, key) => {
          const value = this.props.add.get(key);
          const active = this.props.edit.get('row') === -1 && this.props.edit.get('col') === key;
          const editItem = getEditable(
            this.props.dispatcher, -1, key, null, column, value, this.props.index, active);
          this.addItems.push(editItem);

          return (
            <span key={key} className={column}>
              {editItem}
            </span>
          );
        })}
        <span>
          <button ref='addBtn' onClick={() => { this.addItem(); }}>Add</button>
        </span>
      </li>
    );
  }
  renderList() {
    return this.props.data.get('rows').map((row, rowKey) => {
      const id = row.get('id');
      const items = LIST_COLS_PAGES[this.props.index].map((column, colKey) => {
        const value = row.getIn(['cols', colKey]);
        const active = this.props.edit.get('row') === rowKey && this.props.edit.get('col') === colKey;
        const editItem = getEditable(
          this.props.dispatcher, rowKey, colKey, id, column, value, this.props.index, active);

        return (
          <span key={colKey} className={column}>
            {editItem}
          </span>
        );
      });
      const daily = row.has('daily') ? formatCurrency(row.get('daily')) : null;

      return (
        <li key={rowKey}>
          {items}
          {daily}
        </li>
      );
    });
  }
  componentDidUpdate(prevProps) {
    if (!prevProps.addBtnFocus && this.props.addBtnFocus) {
      window.setTimeout(() => {
        this.refs.addBtn && this.refs.addBtn.focus();
      }, 0);
    }
  }
  render() {
    const listClasses = [
      'list-insert',
      `list-${this.props.page}`,
      'list'
    ].join(' ');

    return (
      <div className={listClasses}>
        {this.renderListHead()}
        <ul className='list-ul'>
          {this.renderLiAdd()}
          {this.renderList()}
        </ul>
      </div>
    );
  }
}

PageList.propTypes = {
  data: PropTypes.instanceOf(map),
  edit: PropTypes.instanceOf(map),
  add: PropTypes.instanceOf(list),
  addBtnFocus: PropTypes.bool,
  index: PropTypes.number,
  page: PropTypes.string
};

