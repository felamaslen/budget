/**
 * Colour functions
 */

import { OVERVIEW_COLUMNS } from './const';
import { COLOR_CATEGORY } from './config';

export const rgba = values => {
  const roundedValues = values.slice(0, 3).map(
    item => Math.max(0, Math.min(255, Math.round(item)))
  ).concat(values.slice(3)).join(',');

  if (values.length === 4) {
    return `rgba(${roundedValues})`;
  }
  return `rgb(${roundedValues})`;
};

/**
 * Get colours for colouring the table
 * @returns {array} list of colour codes
 */
export const getOverviewCategoryColor = () => {
  return OVERVIEW_COLUMNS.slice(1).map(item => item[0]).map(column => {
    if (COLOR_CATEGORY[column]) {
      return COLOR_CATEGORY[column];
    }
    if (column === 'net') {
      return [COLOR_CATEGORY.spending, COLOR_CATEGORY.income];
    }
    if (column === 'predicted') {
      return COLOR_CATEGORY.balance;
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

const colorKeyList = [
  [1, 0, 103],
  [255, 0, 86],
  [158, 0, 142],
  [14, 76, 161],
  [0, 95, 57],
  [149, 0, 58],
  [255, 147, 126],
  [0, 21, 68],
  [107, 104, 130],
  [0, 0, 255],
  [0, 125, 181],
  [106, 130, 108],
  [0, 174, 126],
  [194, 140, 159],
  [190, 153, 112],
  [0, 143, 156],
  [95, 173, 78],
  [255, 0, 0],
  [255, 2, 157]
];

const colorKeyRGB = index => {
  if (index === 0) {
    return [0, 0, 0];
  }
  return colorKeyList[index % colorKeyList.length];
};
export const colorKey = index => {
  return colorKeyRGB(index);
};

