/**
 * Colour functions
 */

import { Map as map } from 'immutable';
import { OVERVIEW_COLUMNS } from '../constants/data';
import { COLOR_CATEGORY } from '../constants/colors';
import { listAverage } from './data';

export function rgba(values) {
    const roundedValues = values
        .slice(0, 3)
        .map(item => Math.max(0, Math.min(255, Math.round(item))))
        .concat(values.slice(3))
        .join(',');

    if (values.length === 4) {
        return `rgba(${roundedValues})`;
    }

    return `rgb(${roundedValues})`;
}

/**
 * Get colours for colouring the table
 * @returns {array} list of colour codes
 */
export function getOverviewCategoryColor() {
    return map(OVERVIEW_COLUMNS.slice(1)
        .map(([key]) => {
            if (COLOR_CATEGORY[key]) {
                return [key, COLOR_CATEGORY[key]];
            }
            if (key === 'net') {
                return [key, [COLOR_CATEGORY.spending, COLOR_CATEGORY.income]];
            }
            if (key === 'predicted') {
                return [key, COLOR_CATEGORY.balance];
            }

            throw new Error(`Unknown overview column: ${key}`);
        })
    );
}

/**
 * Get a colour on a scale, based on value (linear)
 * @param {integer} value: the value to score
 * @param {array} range: minimum and maximum of range
 * @param {array} median: median values in range
 * @param {array} color: color scale(s) to use
 * @returns {array} rgb values
 */
export function getOverviewScoreColor(value, range, median, color) {
    const blank = [255, 255, 255]; // white

    if (range.min === range.max) {
        return blank;
    }

    const medianValue = value < 0
        ? median.negative
        : median.positive;

    const cost = Math.abs(value);

    const max = value > 0
        ? range.max
        : -range.min;

    const score = cost > medianValue
        ? 0.5 * (1 + (cost - medianValue) / (max - medianValue))
        : 0.5 * cost / medianValue;

    const split = color.length === 2 && (range.min < 0 || range.max > 0);

    let theColor = color;
    if (split) {
        // score separately for positive vs. negative
        const end = value < 0
            ? 0
            : 1;
        theColor = color[end];
    }
    else if (value < 0) {
        return blank;
    }

    return theColor.map(item => Math.round(255 - (255 - item) * score));
}

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

export function colorKey(index) {
    return colorKeyRGB(index);
}

export function averageColor(colors) {
    if (!colors.size) {
        return [255, 255, 255, 0];
    }

    const red = colors.map(color => color[0]);
    const green = colors.map(color => color[1]);
    const blue = colors.map(color => color[2]);

    return [
        listAverage(red),
        listAverage(green),
        listAverage(blue)
    ];
}

