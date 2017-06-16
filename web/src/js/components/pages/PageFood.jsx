/**
 * Food page component
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { Map as map } from 'immutable';
import { YMD } from '../../misc/date';
import { getEditable } from '../../misc/data.jsx';

const columns = ['date', 'item', 'category', 'cost', 'shop'];

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
        {columns.map((column, key) => {
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

    return (
      <ul className='list-ul'>
        {liAdd}
      </ul>
    );
  }
}

PageFood.propTypes = {
  data: PropTypes.instanceOf(map),
  edit: PropTypes.instanceOf(map)
};

