/**
 * Food page component
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { Map as map } from 'immutable';
import { LIST_COLS_PAGES } from '../../misc/const';
import { YMD } from '../../misc/date';
import { getEditable } from '../../misc/data.jsx';

const getDefaultValue = column => {
  if (column === 'date') {
    return new YMD();
  }
  return null;
};

export class PageFood extends PureControllerView {
  render() {
    const liAdd = (
      <li className='li-add'>
        {LIST_COLS_PAGES[this.props.index].map((column, key) => {
          const value = getDefaultValue(column);
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
  index: PropTypes.number,
  page: PropTypes.string
};

