/**
 * Text formatters
 */

import {
  SYMBOL_CURRENCY_HTML, SYMBOL_CURRENCY_RAW
} from './config';

/**
 * @function capitalise
 * @param {string} string: value to capitalise
 * @returns {string} capitalised string
 */
export const capitalise = string => {
  return string.substring(0, 1).toUpperCase() +
    string.substring(1).toLowerCase();
};

/**
 * @function round
 * @param {float} value: value to round
 * @param {integer} precision: precision to round to
 * @returns {float} rounded value
 */
const round = (value, precision) => {
  const exp = Math.pow(10, precision);
  return Math.round(exp * value) / exp;
};

/**
 * @function numberFormat
 * @param {float} value: value to format
 * @returns {string} formatted number
 */
export const numberFormat = value => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * @function leadingZeroes
 * @param {integer} value: number to add zeroes to
 * @param {integer} numZeroes: number of zeroes to fill
 * @returns {string} formatted number
 */
export const leadingZeroes = (value, numZeroes) => {
  const numAdd = numZeroes - Math.floor(Math.log10(value)) - 1;
  const zeroes = Array.apply(null, new Array(numAdd)).map(() => '0').join('');
  return `${zeroes}${value}`;
};

/**
 * Format currency values for display
 * @param {integer} value: value in GBX
 * @param {object} options: options to pass to formatter
 * @returns {string} formatted value
 */
export const formatCurrency = (value, options) => {
  if (!options) {
    options = {};
  }
  if (!options.precision) {
    options.precision = 0;
  }
  let output = '';
  if (!options.brackets) {
    const sign = value < 0 ? '\u2212' : '';
    output += sign;
  }
  if (!options.noSymbol) {
    const symbol = options.raw ? SYMBOL_CURRENCY_RAW : SYMBOL_CURRENCY_HTML;
    output += symbol;
  }

  const absValue = Math.abs(value) / 100;
  let log = 0;
  let abbreviation = '';
  if (options.abbreviate && value !== 0) {
    const abbr = ['k', 'm', 'bn', 'tn'];
    log = Math.min(Math.floor(Math.log10(absValue) / 3), abbr.length);
    if (log > 0) {
      abbreviation = abbr[log - 1];
    }
  }
  if (options.suffix) {
    abbreviation += options.suffix;
  }
  let valueRaw;
  if (log > 0) {
    valueRaw = absValue / Math.pow(10, log * 3);
    if (options.abbreviate) {
      valueRaw = round(valueRaw, options.precision);
    }
  }
  else {
    valueRaw = absValue;
    if (!options.noPence) {
      valueRaw = valueRaw.toFixed(2);
    }
  }
  if (options.noPence) {
    valueRaw = round(valueRaw, log ? options.precision : 0);
  }
  const formatted = numberFormat(valueRaw);

  output += formatted + abbreviation;
  if (options.brackets && value < 0) {
    output = `(${output})`;
  }

  return output;
};

/**
 * Get tick sizes for graphs
 * @param {float} min: minimum value
 * @param {float} max: maximum value
 * @param {integer} numTicks: number of ticks to produce
 * @returns {float} tick length
 */
export const getTickSize = (min, max, numTicks) => {
  const minimum = (max - min) / numTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(minimum)));
  const res = minimum / magnitude;
  let tick;
  if (res > 5) {
    tick = 10 * magnitude;
  }
  else if (res > 2) {
    tick = 5 * magnitude;
  }
  else if (res > 1) {
    tick = 2 * magnitude;
  }
  else {
    tick = magnitude;
  }

  return tick;
};

/**
 * Format age text
 * @param {integer} seconds: number of seconds to age
 * @param {boolean} shortAbbr: whether to abbreviate concisely
 * @returns {string} age text
 */
export const formatAge = (seconds, shortAbbr) => {
  const measures = [
    [1, 's', 'second'],
    [60, 'm', 'minute'],
    [3600, 'h', 'hour'],
    [86400, 'd', 'day'],
    [86400 * 30, 'M', 'month'],
    [86400 * 365, 'Y', 'year']
  ];
  const secondsNormalised = Math.max(seconds, 1);
  const measure = measures.reverse().filter(item => {
    return secondsNormalised >= item[0];
  })[0];

  const rounded = Math.round(seconds / measure[0]);
  const plural = !shortAbbr ? (rounded === 1 ? '' : 's') : '';
  const units = measure[shortAbbr ? 1 : 2] + plural;

  return shortAbbr ? rounded + units : `${rounded} ${units} ago`;
};

