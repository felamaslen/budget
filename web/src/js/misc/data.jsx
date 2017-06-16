/**
 * Data methods (using immutable objects)
 */

import { AVERAGE_MEDIAN } from './const';
import React from 'react';
import EditableDate from '../components/Editable/EditableDate';
import EditableCost from '../components/Editable/EditableCost';

/**
 * Gets the mean or median of an immutable list of values
 * @param {List} list: immutable list
 * @param {integer} offset: don't count the last <offset> values
 * @param {integer} mode: output either median or mean
 * @returns {integer} median / mean value
 */
export const listAverage = (list, offset, mode) => {
  const values = offset ? list.slice(0, -offset) : list;
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
  return list.reduce((a, b) => a + b, 0) / list.size;
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
 * @param {List} queue: the queue of stuff to update
 * @param {array} startYearMonth: start year/month of the overview data
 * @returns {string} JSON-encoded list for ajax request
 */
export const buildQueueRequestList = (queue, startYearMonth) => {
  const startYear = startYearMonth[0];
  const startMonth = startYearMonth[1];
  const reqList = queue.map(dataItem => {
    if (dataItem.get('page') === 'overview') {
      const key = dataItem.get('row');
      const year = startYear + Math.floor((key + startMonth - 1) / 12);
      const month = (startMonth + key - 1) % 12 + 1;
      const balance = dataItem.get('value');

      return ['update/overview', {}, { year, month, balance }];
    }

    return null;
  }).filter(item => item !== null);

  return JSON.stringify(reqList.toJS());
};

/**
 * @function getEditable
 * @param {string} column: the column being edited
 * @param {Dispatcher} dispatcher: store
 * @param {integer} row: row of item
 * @param {integer} col: column of item
 * @param {mixed} value: value of item
 * @param {string} page: page of item
 * @param {boolean} active: whether item is being edited
 * @returns {Editable}: the correct editable react component class
 */
export const getEditable = (column, dispatcher, row, col, value, page, active) => {
  if (column === 'date') {
    return <EditableDate dispatcher={dispatcher} row={row} col={col}
      value={value} page={page} active={active} />;
  }

  // default is currency
  return <EditableCost dispatcher={dispatcher} row={row} col={col}
    value={value} page={page} active={active} />;
};

