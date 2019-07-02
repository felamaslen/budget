import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import shortid from 'shortid';

import { AVERAGE_MEDIAN, AVERAGE_EXP } from '~client/constants';
import { PAGES } from '~client/constants/data';

export const IDENTITY = state => state;

export function getPeriodMatch(shortPeriod, defaultPeriod = process.env.DEFAULT_FUND_PERIOD || '') {
    const periodRegex = /^([a-z]+)([0-9]+)$/;

    let match = (shortPeriod || defaultPeriod).match(periodRegex);
    if (!match) {
        match = defaultPeriod.match(periodRegex);

        if (!match) {
            return { period: 'year', length: '1' };
        }
    }

    return { period: match[1], length: match[2] };
}

export function replaceAtIndex(array, index, value, isFunction = false) {
    if (index === -1) {
        return array;
    }

    const nextValue = isFunction
        ? value(array[index])
        : value;

    return array
        .slice(0, index)
        .concat([nextValue])
        .concat(array.slice(index + 1));
}

export const removeAtIndex = (array, index) => array
    .slice(0, index)
    .concat(array.slice(index + 1));

export const getTransactionsList = data => data.map(({ date, units, cost }) => ({
    id: shortid.generate(),
    date: DateTime.fromISO(date),
    units: Number(units) || 0,
    cost: Number(cost) || 0
}));

export const transactionShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(DateTime).isRequired,
    units: PropTypes.number.isRequired,
    cost: PropTypes.number.isRequired
}).isRequired;

export const transactionsListShape = PropTypes.arrayOf(transactionShape);

const isTransactionsList = item => Array.isArray(item) && item.every(value =>
    typeof value === 'object' &&
    Object.keys(value).length === 4 &&
    typeof value.id === 'string' &&
    value.id.length >= 7 &&
    value.date instanceof DateTime &&
    typeof value.units === 'number' &&
    typeof value.cost === 'number'
);

const getRoundedTotal = key => array => Number(array.reduce((sum, { [key]: value }) => sum + value, 0).toFixed(4));

export const getTotalUnits = getRoundedTotal('units');
export const getTotalCost = getRoundedTotal('cost');

export const isSold = transactionsList => getTotalUnits(transactionsList) === 0;

export const addToTransactionsList = (transactionsList, item) => transactionsList.concat(getTransactionsList([item]));

export function modifyTransaction(transactionsList, index, item) {
    const oldItem = transactionsList[index];
    const { date: rawDate = oldItem.date } = item;

    let date = rawDate;
    if (rawDate !== oldItem.date) {
        date = DateTime.fromISO(rawDate);
    }

    return replaceAtIndex(transactionsList, index, { ...oldItem, ...item, date });
}

export const modifyTransactionById = (transactionsList, id, item) => modifyTransaction(
    transactionsList,
    transactionsList.findIndex(({ id: itemId }) => itemId === id),
    item
);

export const formatTransactionsList = transactionsList => transactionsList
    .sort(({ date: dateA }, { date: dateB }) => dateA - dateB)
    .map(({ date, units, cost }) => ({
        date: date.toISODate(),
        units,
        cost
    }));

export const withoutIds = array => array.map(({ id, ...doc }) => doc);

export function dataEquals(item, compare) {
    if (item instanceof DateTime && compare instanceof DateTime) {
        return item.hasSame(compare, 'day');
    }
    if (isTransactionsList(item) && isTransactionsList(compare)) {
        if (item.length !== compare.length) {
            return false;
        }

        const compareWithoutIds = withoutIds(compare);

        return withoutIds(item).every(
            (itemValue, index) => Object.keys(itemValue).every(
                key => dataEquals(itemValue[key], compareWithoutIds[index][key])
            )
        );
    }

    return item === compare;
}

export function arrayAverage(values, mode = null) {
    if (!values.length) {
        return NaN;
    }
    if (mode === AVERAGE_MEDIAN) {
        const sorted = values.slice().sort((prev, next) => prev - next);

        const oddLength = sorted.length & 1;
        if (oddLength) {
            // odd: get the middle value
            return sorted[Math.floor((sorted.length - 1) / 2)];
        }

        // even: get the middle two values and find the average of them
        const low = sorted[Math.floor(sorted.length / 2) - 1];
        const high = sorted[Math.floor(sorted.length / 2)];

        return (low + high) / 2;
    }
    if (mode === AVERAGE_EXP) {
        const weights = new Array(values.length)
            .fill(0)
            .map((item, key) => 2 ** (-(key + 1)))
            .reverse();

        const weightSum = weights.reduce((sum, value) => sum + value, 0);

        return values.reduce((average, value, index) => average + value * weights[index], 0) / weightSum;
    }

    // mean
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const testableRandom = (key = 0) => {
    if (process.env.NODE_ENV === 'test') {
        return (0.36123 * (key + 1)) % 1;
    }

    return Math.random();
};

export function randnBm(rand1 = testableRandom(0), rand2 = testableRandom(1)) {
    return Math.sqrt(-2 * Math.log(rand1)) * Math.cos(2 * Math.PI * rand2);
}

export function getValueForTransmit(value) {
    if (typeof value === 'number') {
        return value;
    }
    if (value instanceof DateTime) {
        return value.toISODate();
    }
    if (isTransactionsList(value)) {
        return formatTransactionsList(value);
    }
    if (typeof value === 'object') {
        return value;
    }

    return value.toString();
}

export function getNullEditable(page) {
    let row = 0;
    if (PAGES[page].list) {
        row = -1;
    }

    return {
        row,
        col: -1,
        page,
        id: null,
        item: null,
        value: null,
        originalValue: null
    };
}

export function getAddDefaultValues(page, now) {
    if (!PAGES[page].list) {
        return [];
    }

    return PAGES[page].cols.map(column => {
        if (column === 'date') {
            return now;
        }
        if (column === 'cost') {
            return 0;
        }
        if (column === 'transactions') {
            return getTransactionsList([]);
        }

        if (['item', 'category', 'shop', 'holiday', 'society'].indexOf(column) > -1) {
            return '';
        }

        return null;
    });
}

export function sortRowsByDate(rows, page, now) {
    const dateKey = PAGES[page].cols.indexOf('date');

    return rows
        .sort(({ id: idA, cols: colsA }, { id: idB, cols: colsB }) =>
            (colsB[dateKey] - colsA[dateKey]) || (idB - idA)
        )
        .reduce(({ lastFuture, accum }, row) => {
            const thisFuture = row.cols[dateKey] > now;

            return {
                lastFuture: thisFuture,
                accum: accum.concat([{
                    ...row,
                    future: thisFuture,
                    firstPresent: !thisFuture && lastFuture
                }])
            };
        }, { lastFuture: false, accum: [] })
        .accum;
}

export const sortByDate = data => data.sort(({ date: dateA }, { date: dateB }) =>
    DateTime.fromISO(dateA) - DateTime.fromISO(dateB));

export function resortListRows(page, now) {
    return state => state.setIn(['pages', page, 'rows'],
        sortRowsByDate(state.getIn(['pages', page, 'rows']), page, now));
}
