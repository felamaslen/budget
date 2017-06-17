/**
 * Food page component
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { List as list, Map as map } from 'immutable';
import { LIST_COLS_PAGES } from '../../misc/const';
import { getEditable } from '../../misc/data.jsx';

export class PageFood extends PureControllerView {
  render() {
    const liAdd = (
      <li className='li-add'>
        {LIST_COLS_PAGES[this.props.index].map((column, key) => {
          const value = this.props.add.get(key);
          const active = this.props.edit.get('row') === -1 && this.props.edit.get('col') === key;
          const editItem = getEditable(column, this.props.dispatcher, -1, key, value, 'food', active);

          return (
            <span key={key} className={column}>
              {editItem}
            </span>
          );
        })}
        <span>
          <button>Add</button>
        </span>
      </li>
    );

    const listClasses = [
      'list-insert',
      `list-${this.props.page}`,
      'list'
    ].join(' ');

    const listHead = LIST_COLS_PAGES[this.props.index].map((column, key) => {
      return <span key={key} className={column}>{column}</span>;
    });

    return (
      <div className={listClasses}>
        <div className='list-head noselect'>
          {listHead}
        </div>
        <ul className='list-ul'>
          {liAdd}
        </ul>
      </div>
    );
  }
}

PageFood.propTypes = {
  data: PropTypes.instanceOf(map),
  edit: PropTypes.instanceOf(map),
  add: PropTypes.instanceOf(list),
  index: PropTypes.number,
  page: PropTypes.string
};

