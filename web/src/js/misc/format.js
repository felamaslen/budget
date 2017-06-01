/**
 * Text formatters
 */

import {
  SYMBOL_CURRENCY_HTML, SYMBOL_CURRENCY_RAW
} from './config';

/**
 * Round a number to a specified precision
 * @param {float} value: value to round
 * @param {integer} precision: precision to round to
 * @returns {float} rounded value
 */
const round = (value, precision) => {
  const exp = Math.pow(10, precision);
  return Math.round(exp * value) / exp;
};

/**
 * Format a number with commas etc.
 * @param {float} value: value to format
 * @returns {string} formatted number
 */
export const numberFormat = value => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

