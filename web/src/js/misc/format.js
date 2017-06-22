/**
 * Text formatters
 */

import { List as list, Map as map } from 'immutable';
import {
  SYMBOL_CURRENCY_HTML, SYMBOL_CURRENCY_RAW
} from './config';

const percent = frac => `${100 * frac}%`;

/**
 * class to visualise data as a bunch of squares
 */
export class BlockPacker {
  constructor(data, width, height) {
    this.data = data;

    this.width = width;
    this.height = height;

    this.numBlockColors = 16;
    this.colorOffset = this.data.reduce((a, b) => a + (b.get('total') & 1), 0);

    this.total = data.reduce((a, b) => a + b.get('total'), 0);
    const totalArea = width * height;

    this.tree = this.data.map(item => item.get('total') * totalArea / this.total);
    this.blocks = list([]);
    this.root = { x: 0, y: 0, w: width, h: height };

    const row = list([]);
    this.rowCount = 0;

    this.squarify(this.tree, row, this.root);
  }
  squarify(children, row, node) {
    if (!children.size) {
      return;
    }
    const row2 = row.push(children.first());
    if (children.size === 1 && row.size === 0) {
      // use all the remaining space for the last child
      this.addNode(children, node);
    }
    else if (this.worst(row, node) >= this.worst(row2, node)) {
      this.squarify(children.shift(), row2, node);
    }
    else {
      const newNode = this.addNode(row, node);
      this.squarify(children, list([]), newNode);
    }
  }
  addNode(row, node) {
    // returns a new node (the rest of the available space)
    const wide = node.w > node.h;

    let freeX = node.x;
    let freeY = node.y; // measured from bottom

    let freeWidth = node.w;
    let freeHeight = node.h;

    let blockWidth = node.w;
    let blockHeight = node.h;

    const sum = row.reduce((a, b) => a + b, 0);

    if (wide) {
      blockWidth = sum / node.h;
      freeWidth -= blockWidth;
      freeX += blockWidth;
    }
    else {
      blockHeight = sum / node.w;
      freeHeight -= blockHeight;
      freeY += blockHeight;
    }

    // add row's blocks
    const newNode = {
      x: freeX,
      y: freeY,
      w: freeWidth,
      h: freeHeight
    };

    const newBlockBits = row.map(item => {
      const thisBlockWidth = wide ? 1 : (item / sum);

      const thisBlockHeight = wide ? (item / sum) : 1;

      const j = this.rowCount++;

      const name = this.data.getIn([j, 'name']);
      const color = (j + this.colorOffset) % this.numBlockColors;
      const value = this.data.getIn([j, 'total']);
      const newBlockBit = map({
        width: percent(thisBlockWidth),
        height: percent(thisBlockHeight),
        name,
        color,
        value
      });

      if (this.data.getIn([j, 'subTree'])) {
        const thisBlocks = new BlockPacker(
          this.data.getIn([j, 'subTree']),
          thisBlockWidth * blockWidth,
          thisBlockHeight * blockHeight
        );
        return newBlockBit.set('blocks', thisBlocks.blocks);
      }
      return newBlockBit;
    });

    const newBlock = map({
      width: percent(blockWidth / this.width),
      height: percent(blockHeight / this.height),
      bits: newBlockBits
    });

    this.blocks = this.blocks.push(newBlock);

    return newNode;
  }
  worst(row, node) {
    // row is a list of areas
    if (row.size === 0) {
      return Infinity;
    }

    const aspect = node.w / node.h;
    const sum = row.reduce((a, b) => a + b, 0);

    if (aspect > 1) {
      // wide, so fill the node from the left
      const rowWidth = sum / node.h;
      return row.reduce((a, b) => {
        const thisAspect = rowWidth * rowWidth / b;
        const worstAspect = Math.max(thisAspect, 1 / thisAspect);
        return worstAspect > a ? worstAspect : a;
      }, 0);
    }
    // tall, so fill the node from the bottom
    const rowHeight = sum / node.w;
    return row.reduce((a, b) => {
      const thisAspect = b / (rowHeight * rowHeight);
      const worstAspect = Math.max(thisAspect, 1 / thisAspect);
      return worstAspect > a ? worstAspect : a;
    }, 0);
  }
}

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
 * round a number to a certain sig. figs
 * @param {float} value: number to display
 * @param {integer} figs: sig figs to restrict to
 * @returns {string} formatted number
 */
export const sigFigs = (value, figs) => {
  if (!value) {
    return value.toFixed(figs - 1);
  }
  const numDigits = Math.floor(Math.log10(Math.abs(value))) + 1;
  const exp = Math.pow(10, Math.max(0, figs - numDigits));
  const absResult = (Math.round(Math.abs(value) * exp) / exp).toString();

  // add extra zeroes if necessary
  const hasDot = absResult.indexOf('.') > -1;
  const numDigitsVisible = absResult.length - (hasDot ? 1 : 0);
  const numTrailingZeroes = Math.max(0, figs - numDigitsVisible);
  const resultWithZeroes = numTrailingZeroes ?
    absResult + (hasDot ? '' : '.') +
    Array.apply(null, new Array(numTrailingZeroes)).map(() => '0').join('')
  : absResult;

  const sign = value < 0 ? '-' : '';
  return `${sign}${resultWithZeroes}`;
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
export const formatPercent = (frac, options) => {
  options.suffix = '%';
  options.noSymbol = true;
  return formatCurrency(10000 * frac, options);
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

