/**
 * Colour functions
 */

import ColorHash from 'color-hash';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { COLOR_CATEGORY } from '~client/constants/colors';
import { arrayAverage } from '~client/modules/data';

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

function getOverviewCategoryKeyColor(key) {
    if (COLOR_CATEGORY[key]) {
        return COLOR_CATEGORY[key];
    }
    if (key.startsWith('net')) {
        return [COLOR_CATEGORY.spending, COLOR_CATEGORY.income];
    }

    throw new Error(`Unknown overview column: ${key}`);
}

export const getOverviewCategoryColor = () => OVERVIEW_COLUMNS.slice(1)
    .reduce((last, [key]) => ({
        ...last,
        [key]: getOverviewCategoryKeyColor(key)
    }), {});

const blank = [255, 255, 255]; // white

const scoreColor = (color, score) => color.map(value => Math.round(255 - (255 - value) * score));

function getScore(value, median, min, max) {
    if (min / max > 0 && value / min < 1) {
        return 0;
    }
    if (value / max > 1) {
        return 1;
    }
    if ((value - min) / (median - min) < 1) {
        return 0.5 * (value - min) / (median - min);
    }

    return 0.5 * (1 + (value - median) / (max - median));
}

export function getOverviewScoreColor(
    value,
    {
        min,
        maxNegative = 0,
        minPositive = 0,
        max
    },
    { negative, positive } = {},
    color
) {
    if (!value || min === max) {
        return blank;
    }

    if (color.length === 2) {
        if (value < 0) {
            return scoreColor(color[0], getScore(-value, -negative, -maxNegative, -min));
        }

        return scoreColor(color[1], getScore(value, positive, minPositive, max));
    }

    return scoreColor(color, getScore(value, positive, min, max));
}

const colorHash = new ColorHash({
    lightness: 0.3,
    saturation: 1
});

export function colorKey(string) {
    return colorHash.rgb(string);
}

export function averageColor(colors) {
    if (!colors.length) {
        return [255, 255, 255, 0];
    }

    return [
        arrayAverage(colors.map(([red]) => red)),
        arrayAverage(colors.map(([, green]) => green)),
        arrayAverage(colors.map(([, , blue]) => blue))
    ];
}
