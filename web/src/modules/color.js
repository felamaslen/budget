/**
 * Colour functions
 */

import { Map as map } from 'immutable';
import ColorHash from 'color-hash';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { COLOR_CATEGORY } from '~client/constants/colors';
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

const colorHash = new ColorHash({
    lightness: 0.3,
    saturation: 1
});

export function colorKey(string) {
    return colorHash.rgb(string);
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

