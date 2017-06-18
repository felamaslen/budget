/**
 * Data methods (using immutable objects)
 */

import React from 'react';
import { List as list, Map as map } from 'immutable';
import { AVERAGE_MEDIAN, PAGES, LIST_PAGES, LIST_COLS_PAGES } from './const';
import { YMD } from './date';
import EditableDate from '../components/Editable/EditableDate';
import EditableCost from '../components/Editable/EditableCost';
import EditableText from '../components/Editable/EditableText';

/**
 * Gets the mean or median of an immutable list of values
 * @param {List} theList: immutable list
 * @param {integer} offset: don't count the last <offset> values
 * @param {integer} mode: output either median or mean
 * @returns {integer} median / mean value
 */
export const listAverage = (theList, offset, mode) => {
  const values = offset ? theList.slice(0, -offset) : theList;
  if (mode === AVERAGE_MEDIAN) {
    // median
    const sorted = values.sort((a, b) => a < b ? -1 : 1);
    if (sorted.size & 1) {
      // odd: get the middle value
      return sorted.get(Math.floor((sorted.size - 1) / 2));
    }
    // even: get the middle two values and find the average of them
    const low = sorted.get(Math.floor(sorted.size / 2) - 1);
    const high = sorted.get(Math.floor(sorted.size / 2));

    return (low + high) / 2;
  }

  // mean
  return theList.reduce((a, b) => a + b, 0) / theList.size;
};

/**
 * Generate random Gaussian increment for a brownian motion
 * Used in fund predictions
 * @returns {float} random value
 */
export const randnBm = () => {
  const u = 1 - Math.random();
  const v = 1 - Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/**
 * Builds a request list for updating the server
 * @param {Record} reduction: app state
 * @returns {string} JSON-encoded list for ajax request
 */
export const buildQueueRequestList = reduction => {
  let startYearMonth = null; // for overview updates
  const queue = reduction.getIn(['appState', 'edit', 'queue']);

  // for multiple updates on the same page
  let reqListPageList = map({});

  let reqList = queue.map(dataItem => {
    const pageIndex = dataItem.get('pageIndex');
    const item = dataItem.get('item');
    const value = dataItem.get('value');

    if (PAGES[pageIndex] === 'overview') {
      if (startYearMonth === null) {
        startYearMonth = reduction.getIn(['appState', 'pages', pageIndex, 'data', 'startYearMonth']);
      }
      const key = dataItem.get('row');
      const year = startYearMonth[0] + Math.floor((key + startYearMonth[1] - 1) / 12);
      const month = (startYearMonth[1] + key - 1) % 12 + 1;
      const balance = value;

      return ['update/overview', {}, { year, month, balance }];
    }

    if (PAGES[pageIndex] === 'analysis') {
      return null; // TODO
    }

    if (LIST_PAGES.indexOf(pageIndex) > -1) {
      const id = dataItem.get('id');

      if (!reqListPageList.has(pageIndex)) {
        reqListPageList = reqListPageList.set(pageIndex, map({}));
      }
      if (!reqListPageList.get(pageIndex).has(id)) {
        reqListPageList = reqListPageList.setIn([pageIndex, id], map({}));
      }
      reqListPageList = reqListPageList.setIn(
        [pageIndex, id, item], (value.toString()));

      return null; // combine and add them later
    }

    return null;
  }).filter(item => item !== null);

  reqListPageList.forEach((item, pageIndex) => {
    item.forEach((row, id) => {
      reqList = reqList.push([`update/${PAGES[pageIndex]}`, {}, row.set('id', id).toJS()]);
    });
  });

  return JSON.stringify(reqList.toJS());
};

/**
 * @function getEditable
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

  default:
    return <EditableText dispatcher={dispatcher} row={row} col={col}
      id={id} item={item} value={value} pageIndex={pageIndex} active={active} />;
  }
};

/**
 * @function getNullEditable
 * @param {integer} pageIndex: page we're on
 * @returns {map} null-editable object ready for navigating
 */
export const getNullEditable = pageIndex => {
  const pageIsList = LIST_PAGES.indexOf(pageIndex) > -1;
  return map({
    row: pageIsList ? -1 : 0,
    col: -1,
    pageIndex,
    id: null,
    item: null,
    value: null,
    originalValue: null
  });
};

/**
 * @function getAddDefaultValues
 * @param {integer} pageIndex: page we're on
 * @returns {list} list of add-items to display on page load
 */
export const getAddDefaultValues = pageIndex => {
  if (!LIST_COLS_PAGES[pageIndex]) {
    return list([]);
  }
  return list(LIST_COLS_PAGES[pageIndex].map(column => {
    if (column === 'date') {
      return new YMD();
    }
    if (column === 'cost') {
      return 0;
    }
    if (column === 'item' || column === 'category' || column === 'shop' ||
      column === 'holiday' || column === 'society') {
      return '';
    }
    return null;
  }));
};

/**
 * Sort list rows by date, and add daily tallies
 * @param {list} rows: rows to sort
 * @param {integer} pageIndex: page which rows are on
 * @returns {list} sorted rows
 */
export const sortRowsByDate = (rows, pageIndex) => {
  const dateKey = LIST_COLS_PAGES[pageIndex].indexOf('date');
  const costKey = LIST_COLS_PAGES[pageIndex].indexOf('cost');
  let dailySum = 0;
  return rows.sort((a, b) => {
    if (a.getIn(['cols', 0]).isAfter(b.getIn(['cols', 0]))) {
      return -1;
    }
    if (b.getIn(['cols', 0]).isAfter(a.getIn(['cols', 0]))) {
      return 1;
    }
    if (a.get('id') > b.get('id')) {
      return -1;
    }
    return 1;
  }).map((row, rowKey) => {
    const lastInDay = rowKey === rows.size - 1 ||
      row.getIn(['cols', dateKey]).isAfter(rows.getIn([rowKey + 1, 'cols', dateKey]));
    dailySum += row.getIn(['cols', costKey]);
    const newRow = lastInDay ? row.set('daily', dailySum) : row.delete('daily');
    if (lastInDay) {
      dailySum = 0;
    }
    return newRow;
  });
};

