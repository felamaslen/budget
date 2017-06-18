/**
 * get an editable component for use in another component
 */

import React from 'react';

import EditableDate from './EditableDate';
import EditableCost from './EditableCost';
import EditableText from './EditableText';
import EditableTransactions from './EditableTransactions';

/**
 * @param {Dispatcher} dispatcher: store
 * @param {integer} row: row of item
 * @param {integer} col: column of item
 * @param {integer} id: the id of the item being edited (for list items)
 * @param {string} item: the item being edited
 * @param {mixed} value: value of item
 * @param {integer} pageIndex: page index of item
 * @param {boolean} active: whether item is being edited
 * @returns {Editable}: the correct editable react component class
 */
export const getEditable = (dispatcher, row, col, id, item, value, pageIndex, active) => {
  switch (item) {
  case 'date':
    return <EditableDate dispatcher={dispatcher} row={row} col={col}
      id={id} item={item} value={value} pageIndex={pageIndex} active={active} />;

  case 'cost':
    if (!value) {
      value = 0;
    }
    return <EditableCost dispatcher={dispatcher} row={row} col={col}
      id={id} item={item} value={value} pageIndex={pageIndex} active={active} />;

  case 'transactions':
    return <EditableTransactions dispatcher={dispatcher} row={row} col={col}
      id={id} item={item} value={value} pageIndex={pageIndex} active={active} />;

  default:
    return <EditableText dispatcher={dispatcher} row={row} col={col}
      id={id} item={item} value={value} pageIndex={pageIndex} active={active} />;
  }
};

