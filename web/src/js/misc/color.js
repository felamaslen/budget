/**
 * Colour functions
 */

import { OVERVIEW_COLUMNS } from './const';
import { COLOR_CATEGORY } from './config';

export const rgb2hex = (rgb) => {
  return '#' + rgb.map(item => {
    const hex = Math.max(0, Math.min(255, Math.round(item))).toString(16);
    return hex.length < 2 ? `0${hex}` : hex;
  }).join('');
};

/**
 * Get colours for colouring the table
 * @returns {array} list of colour codes
 */
export const getOverviewCategoryColor = () => {
  return OVERVIEW_COLUMNS.slice(1).map(column => {
    if (COLOR_CATEGORY[column]) {
      return COLOR_CATEGORY[column];
    }
    if (column === 'Net') {
      return [COLOR_CATEGORY.Spending, COLOR_CATEGORY.Income];
    }
    if (column === 'Predicted') {
      return COLOR_CATEGORY.Balance;
    }
    return null;
  });
};

/**
 * Get a colour on a scale, based on value (linear)
 * @param {integer} value: the value to score
 * @param {array} range: minimum and maximum of range
 * @param {array} median: median values in range
 * @param {array} color: color scale(s) to use
 * @returns {array} rgb values
 */
export const getOverviewScoreColor = (value, range, median, color) => {
  if (range[0] === range[1]) {
    return [255, 255, 255]; // white
  }

  let score;

  let medianValue = median[0];
  let cost = value;
  let max = range[1];
  if (value < 0) {
    medianValue = -median[1];
    cost *= -1;
    max = -range[0];
  }

  if (cost > medianValue) {
    score = 0.5 * (1 + (cost - medianValue) / (max - medianValue));
  }
  else {
    score = 0.5 * cost / medianValue;
  }

  const split = color.length === 2 && (range[0] < 0 || range[1] > 0);
  let theColor = color;
  if (split) {
    // score separately for positive vs. negative
    const end = value < 0 ? 0 : 1;
    theColor = color[end];
  }

  return theColor.map(item => Math.round(255 - (255 - item) * score));
};

