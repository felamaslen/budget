import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import shortid from 'shortid';

import { AVERAGE_MEDIAN, AVERAGE_EXP } from '~client/constants';

export const IDENTITY = state => state;
export const NULL = () => null;

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

export const sortByTotal = rows => rows.slice()
    .sort(({ total: totalA }, { total: totalB }) => totalB - totalA);

export const limitTimeSeriesLength = (timeSeries, limit) => new Array(timeSeries.length)
    .fill(0)
    .reduce(last => {
        if (last.length <= limit) {
            return last;
        }

        const [closestIndex] = last.slice(1).reduce(([closest, interval], [time], index) => {
            const thisInterval = time - last[index][0];
            if (thisInterval < interval) {
                return [index, thisInterval];
            }

            return [closest, interval];
        }, [1, Infinity]);

        return last.slice(0, closestIndex)
            .concat(last.slice(closestIndex + 1));
    }, timeSeries);

export const randnBm = () => Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());

export function getValueFromTransmit(dataType, value) {
    if (dataType === 'date') {
        return DateTime.fromISO(value);
    }
    if (dataType === 'cost') {
        return parseInt(value, 10) || 0;
    }
    if (dataType === 'transactions') {
        return getTransactionsList(value);
    }

    return String(value);
}

export function getValueForTransmit(dataType, value) {
    if (dataType === 'date') {
        return value.toISODate();
    }
    if (dataType === 'transactions') {
        return formatTransactionsList(value);
    }

    return getValueFromTransmit(dataType, value);
}

export const sortByDate = data => data.sort(({ date: dateA }, { date: dateB }) =>
    DateTime.fromISO(dateA) - DateTime.fromISO(dateB));

export const fieldExists = value => typeof value !== 'undefined' &&
    !(typeof value === 'string' && !value.length);
