/**
 * List page component
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { List as list, Map as map } from 'immutable';
import { LIST_COLS_PAGES } from '../../misc/const';
import { formatCurrency } from '../../misc/format';
import { getEditable } from '../Editable/getEditable';
import { aListItemAdded, aListItemDeleted } from '../../actions/EditActions';

export class PageList extends PureControllerView {
  addItem() {
    this.dispatchAction(aListItemAdded(this.addItems));
  }
  renderListHead() {
    const daily = this.props.daily ? (
      <span>
        <span className='daily'>Daily</span>
        <span className='weekly'>Weekly:</span>
        <span className='weekly-value'>{formatCurrency(
          this.props.data.getIn(['data', 'weekly']), { abbreviate: true, precision: 1 }
        )}</span>
      </span>
    ) : null;

    return (
      <div className='list-head noselect'>
        {LIST_COLS_PAGES[this.props.index].map((column, key) => {
          return <span key={key} className={column}>{column}</span>;
        })}
        {daily}
        <span className='total'>Total:</span>
        <span className='total-value'>{formatCurrency(
          this.props.data.getIn(['data', 'total']), { abbreviate: true, precision: 1 }
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
  renderListExtra() {
    return null;
  }
  renderList() {
    return this.props.data.get('rows').map((row, rowKey) => {
      const id = row.get('id');

      const deleteBtn = (
        <span className='delete'>
          <a onClick={() => {
            this.dispatchAction(aListItemDeleted({
              pageIndex: this.props.index,
              key: rowKey
            }));
          }}>&times;</a>
        </span>
      );

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

      const dailyText = this.props.daily && row.has('daily')
        ? formatCurrency(row.get('daily')) : null;
      const daily = this.props.daily ? (
        <span className='daily'>{dailyText}</span>
      ) : null;

      return (
        <li key={rowKey}>
          {items}
          {daily}
          {this.renderListExtra(row, rowKey)}
          {deleteBtn}
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
  daily: PropTypes.bool,
  index: PropTypes.number,
  page: PropTypes.string
};

