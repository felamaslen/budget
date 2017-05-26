/**
 * Data methods (using immutable objects)
 */

import { AVERAGE_MEDIAN } from './const';

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
