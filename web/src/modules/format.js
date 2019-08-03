import { DateTime } from 'luxon';

import { SYMBOL_CURRENCY_HTML, SYMBOL_CURRENCY_RAW } from '~client/constants';

export const percent = frac => `${Math.round(100000 * frac) / 1000}%`;

export function capitalise(string) {
    return `${string.substring(0, 1).toUpperCase()}${string.substring(1).toLowerCase()}`;
}

function round(value, precision) {
    const exp = Math.pow(10, precision);

    return Math.round(exp * value) / exp;
}

export function numberFormat(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

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

    return absValue.toFixed(precision);
}

export function formatCurrency(value, customOptions = {}) {
    const options = {
        abbreviate: false,
        brackets: false,
        noSymbol: false,
        noPence: false,
        suffix: null,
        raw: false,
        ...customOptions
    };

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

    let {
        precision = options.abbreviate
            ? 0
            : 2
    } = options;

    if (options.abbreviate && log === 0) {
        precision = 2;
    }

    const abbreviation = log > 0
        ? abbr[log - 1]
        : '';

    const suffix = options.suffix || '';

    const valueRaw = getCurrencyValueRaw(
        absValue, log, options.abbreviate, precision, options.noPence
    );

    const formatted = numberFormat(valueRaw);

    if (options.brackets && value < 0) {
        return `(${symbol}${formatted}${abbreviation}${suffix})`;
    }

    return `${sign}${symbol}${formatted}${abbreviation}${suffix}`;
}

export function formatPercent(frac, options = {}) {
    return formatCurrency(100 * 100 * frac, {
        ...options, suffix: '%', noSymbol: true
    });
}

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

export function formatItem(item, value) {
    if (item === 'date') {
        return value.toLocaleString(DateTime.DATE_SHORT);
    }
    if (item === 'cost') {
        return formatCurrency(value);
    }
    if (item === 'transactions') {
        return String(value
            ? value.length
            : 0
        );
    }

    return String(value);
}
