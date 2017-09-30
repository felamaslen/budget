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
        this.colorOffset = this.data.reduce((sum, item) => sum + (item.get('total') & 1), 0);

        this.total = data.reduce((sum, item) => sum + item.get('total'), 0);
        const totalArea = width * height;

        this.tree = this.data.map(item => item.get('total') * totalArea / this.total);
        this.blocks = list.of();
        this.root = {
            xPos: 0,
            yPos: 0,
            width,
            height
        };

        const row = list.of();
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
            this.squarify(children, list.of(), newNode);
        }
    }
    addNode(row, node) {
        // returns a new node (the rest of the available space)
        const wide = node.width > node.height;

        let freeX = node.xPos;
        let freeY = node.yPos; // measured from bottom

        let freeWidth = node.width;
        let freeHeight = node.height;

        let blockWidth = node.width;
        let blockHeight = node.height;

        const totalArea = row.reduce((sum, area) => sum + area, 0);

        if (wide) {
            blockWidth = totalArea / node.height;
            freeWidth -= blockWidth;
            freeX += blockWidth;
        }
        else {
            blockHeight = totalArea / node.width;
            freeHeight -= blockHeight;
            freeY += blockHeight;
        }

        // add row's blocks
        const newNode = {
            xPos: freeX,
            yPos: freeY,
            width: freeWidth,
            height: freeHeight
        };

        const newBlockBits = row.map(item => {
            const thisBlockWidth = wide
                ? 1
                : item / totalArea;

            const thisBlockHeight = wide
                ? item / totalArea
                : 1;

            const key = this.rowCount++;

            const name = this.data.getIn([key, 'name']);
            const color = (key + this.colorOffset) % this.numBlockColors;
            const value = this.data.getIn([key, 'total']);
            const newBlockBit = map({
                width: percent(thisBlockWidth),
                height: percent(thisBlockHeight),
                name,
                color,
                value
            });

            if (this.data.getIn([key, 'subTree'])) {
                const thisBlocks = new BlockPacker(
                    this.data.getIn([key, 'subTree']),
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

        const nodeAspect = node.width / node.height;

        const totalArea = row.reduce((sum, area) => sum + area, 0);

        if (nodeAspect > 1) {
            // wide, so fill the node from the left
            const rowWidth = totalArea / node.height;

            return row.reduce((worstAspect, area) => {
                const thisAspect = rowWidth * rowWidth / area;
                const thisWorst = Math.max(thisAspect, 1 / thisAspect);

                if (thisWorst > worstAspect) {
                    return thisWorst;
                }

                return worstAspect;
            }, 0);
        }

        // tall, so fill the node from the bottom
        const rowHeight = totalArea / node.width;

        // calculate the worst aspect ratio possible in the row
        return row.reduce((worstAspect, area) => {
            const thisAspect = area / (rowHeight * rowHeight);
            const thisWorst = Math.max(thisAspect, 1 / thisAspect);

            if (thisWorst > worstAspect) {
                return thisWorst;
            }

            return worstAspect;
        }, 0);
    }
}

/**
 * @function capitalise
 * @param {string} string: value to capitalise
 * @returns {string} capitalised string
 */
export function capitalise(string) {
    return `${string.substring(0, 1).toUpperCase()}${string.substring(1).toLowerCase()}`;
}

/**
 * @function round
 * @param {float} value: value to round
 * @param {integer} precision: precision to round to
 * @returns {float} rounded value
 */
function round(value, precision) {
    const exp = Math.pow(10, precision);

    return Math.round(exp * value) / exp;
}

/**
 * @function numberFormat
 * @param {float} value: value to format
 * @returns {string} formatted number
 */
export function numberFormat(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function getSign(number) {
    if (number < 0) {
        return '-';
    }

    return '';
}

/**
 * round a number to a certain sig. figs
 * @param {float} value: number to display
 * @param {integer} figs: sig figs to restrict to
 * @returns {string} formatted number
 */
export function sigFigs(value, figs) {
    if (value === 0) {
        return value.toFixed(figs - 1);
    }

    const numDigits = Math.floor(Math.log10(Math.abs(value))) + 1;
    const exp = Math.pow(10, Math.min(figs - 1, Math.max(0, figs - numDigits)));
    const absResult = (Math.round(Math.abs(value) * exp) / exp).toString();

    // add extra zeroes if necessary
    const hasDot = absResult.indexOf('.') > -1;
    const numDigitsVisible = absResult.length - (hasDot >> 0);
    const numTrailingZeroes = Math.max(0, figs - numDigitsVisible);

    const sign = getSign(value);

    if (numTrailingZeroes > 0) {
        const dot = hasDot
            ? ''
            : '.';

        const zeroes = new Array(numTrailingZeroes).fill('0');

        return `${sign}${absResult}${dot}${zeroes.join('')}`;
    }

    return `${sign}${absResult}`;
}

/**
 * @function leadingZeroes
 * @param {integer} value: number to add zeroes to
 * @param {integer} numZeroes: number of zeroes to fill
 * @returns {string} formatted number
 */
export function leadingZeroes(value, numZeroes) {
    const numAdd = value
        ? numZeroes - Math.floor(Math.log10(value)) - 1
        : numZeroes - 1;

    if (numAdd > 0) {
        const zeroes = new Array(numAdd)
            .fill('0')
            .join('');

        return `${zeroes}${value}`;
    }

    return value.toString();
}

function getCurrencyValueRaw(absValue, log, abbreviate, precision, noPence) {
    if (log > 0) {
        const measure = absValue / Math.pow(10, log * 3);

        if (abbreviate || noPence) {
            return round(measure, precision).toString();
        }

        return measure.toString();
    }

    if (noPence) {
        return Math.round(absValue).toString();
    }

    return absValue.toFixed(2);
}

/**
 * Format currency values for display
 * @param {integer} value: value in GBX
 * @param {object} options: options to pass to formatter
 * @returns {string} formatted value
 */
export function formatCurrency(value, customOptions = {}) {
    const options = Object.assign({
        abbreviate: false,
        precision: 0,
        brackets: false,
        noSymbol: false,
        noPence: false,
        suffix: null,
        raw: false
    }, customOptions);

    const sign = options.brackets || value >= 0
        ? ''
        : '\u2212';

    const setSymbol = options.raw
        ? SYMBOL_CURRENCY_RAW
        : SYMBOL_CURRENCY_HTML;

    const symbol = options.noSymbol
        ? ''
        : setSymbol;

    const absValue = Math.abs(value) / 100;

    const abbr = ['k', 'm', 'bn', 'tn'];

    const log = options.abbreviate && value !== 0
        ? Math.min(Math.floor(Math.log10(absValue) / 3), abbr.length)
        : 0;

    const abbreviation = log > 0
        ? abbr[log - 1]
        : '';

    const suffix = options.suffix || '';

    const valueRaw = getCurrencyValueRaw(
        absValue, log, options.abbreviate, options.precision, options.noPence
    );

    const formatted = numberFormat(valueRaw);

    if (options.brackets && value < 0) {
        return `(${symbol}${formatted}${abbreviation}${suffix})`;
    }

    return `${sign}${symbol}${formatted}${abbreviation}${suffix}`;
}

export function formatPercent(frac, options) {
    options.suffix = '%';
    options.noSymbol = true;

    return formatCurrency(100 * 100 * frac, {
        noSymbol: true,
        suffix: '%'
    });
}

/**
 * Get tick sizes for graphs
 * @param {float} min: minimum value
 * @param {float} max: maximum value
 * @param {integer} numTicks: number of ticks to produce
 * @returns {float} tick length
 */
export function getTickSize(min, max, numTicks) {
    const minimum = (max - min) / numTicks;
    const magnitude = Math.pow(10, Math.floor(Math.log10(minimum)));
    const res = minimum / magnitude;

    if (res > 5) {
        return 10 * magnitude;
    }

    if (res > 2) {
        return 5 * magnitude;
    }

    if (res > 1) {
        return 2 * magnitude;
    }

    return magnitude;
}

/**
 * Format age text
 * @param {integer} seconds: number of seconds to age
 * @param {boolean} shortAbbr: whether to abbreviate concisely
 * @returns {string} age text
 */
export function formatAge(seconds, shortAbbr) {
    const measures = list([
        [1, 's', 'second'],
        [60, 'm', 'minute'],
        [3600, 'h', 'hour'],
        [86400, 'd', 'day'],
        [86400 * 30, 'M', 'month'],
        [86400 * 365, 'Y', 'year']
    ]);

    const getMeasureText = (measure, thisSeconds, floor) => {
        const value = thisSeconds / measure[0];
        const rounded = floor
            ? Math.floor(value)
            : Math.round(value);

        const plural = shortAbbr || rounded === 1
            ? ''
            : 's';

        const measureIndex = shortAbbr
            ? 1
            : 2;

        const units = measure[measureIndex] + plural;

        if (shortAbbr) {
            return `${rounded}${units}`;
        }

        return `${rounded} ${units}`;
    };

    const secondsNormalised = Math.max(seconds, 1);
    const mainMeasureIndex = measures.findLastIndex(item => item[0] <= secondsNormalised);
    const mainMeasure = measures.get(mainMeasureIndex);
    const measureText = [getMeasureText(mainMeasure, secondsNormalised, true)];

    if (mainMeasureIndex > 0) {
        const extraSeconds = secondsNormalised % mainMeasure[0];
        if (extraSeconds > 0) {
            measureText.push(getMeasureText(measures.get(mainMeasureIndex - 1), extraSeconds));
        }
    }

    const abbr = shortAbbr
        ? ''
        : ' ago';

    return `${measureText.join(', ')}${abbr}`;
}

