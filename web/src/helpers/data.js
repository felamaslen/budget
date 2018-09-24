/**
 * Data methods (using immutable objects)
 */

import { List as list, Map as map } from 'immutable';
import { DateTime } from 'luxon';
import { AVERAGE_MEDIAN, AVERAGE_EXP } from '../constants';
import { PAGES } from '../constants/data';

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

export function uuid(rand = Math.random(), random = false) {
    if (process.env.NODE_ENV === 'test' && !random) {
        return 0x4812;
    }

    return Math.floor((1 + rand) * 0x10000);
}

export class TransactionsList {
    constructor(data, isShort = true) {
        this.list = data;
        this.idCount = 0;

        if (isShort) {
            // turn a short list into a descriptive list
            this.list = list(data)
                .map(item => {
                    return map({
                        id: ++this.idCount,
                        date: DateTime.fromISO(item.date),
                        units: item.units,
                        cost: item.cost
                    });
                })
                .sort((prev, next) => prev.get('date') - next.get('date'));

            this.size = this.list.size;
        }
        else {
            this.idCount = this.list.size;
            this.size = this.list.size;
        }
    }
    format() {
        return this.list.map(item => item.delete('id')
            .set('date', item.get('date').toISODate()))
            .toJS();
    }
    valueOf() {
        return this.list;
    }
    maxId() {
        if (this.size > 0) {
            return this.list.map(item => item.get('id')).max();
        }

        return 0;
    }
    remove(key) {
        return new TransactionsList(this.list.splice(key, 1), false);
    }
    setIn(key, value) {
        return new TransactionsList(this.list.setIn(key, value), false);
    }
    push(item) {
        return new TransactionsList(this.list.push(map({
            id: this.maxId() + 1,
            date: item.date,
            units: item.units,
            cost: item.cost
        })), false);
    }
    filter(callback) {
        return new TransactionsList(this.list.filter(callback), false);
    }
    static getUnits(aList) {
        return Number(aList.reduce((sum, item) => sum + item.get('units'), 0).toFixed(4));
    }
    static getCost(aList) {
        return aList.reduce((sum, item) => sum + item.get('cost'), 0);
    }
    getTotalUnits() {
        return TransactionsList.getUnits(this.list);
    }
    getTotalCost() {
        return TransactionsList.getCost(this.list);
    }
    isSold() {
        return this.getTotalUnits() === 0;
    }
}

export function dataEquals(item, compare) {
    if (item instanceof DateTime) {
        if (compare instanceof DateTime) {
            return item.hasSame(compare, 'day');
        }

        return false;
    }

    if (item instanceof TransactionsList) {
        if (compare instanceof TransactionsList) {
            if (item.size !== compare.size) {
                return false;
            }

            return item.list.reduce((equal, listItem, key) => {
                return equal &&
                    listItem.get('date').hasSame(compare.list.getIn([key, 'date']), 'day') &&
                    listItem.get('units') === compare.list.getIn([key, 'units']) &&
                    listItem.get('cost') === compare.list.getIn([key, 'cost']);

            }, true);
        }

        return false;
    }

    return item === compare;
}

export function listAverage(values, mode = null) {
    if (!values.size) {
        return NaN;
    }

    if (mode === AVERAGE_MEDIAN) {
        const sorted = values.sort((prev, next) => {
            if (prev < next) {
                return -1;
            }

            return 1;
        });

        const oddLength = sorted.size & 1;
        if (oddLength) {
            // odd: get the middle value
            return sorted.get(Math.floor((sorted.size - 1) / 2));
        }

        // even: get the middle two values and find the average of them
        const low = sorted.get(Math.floor(sorted.size / 2) - 1);
        const high = sorted.get(Math.floor(sorted.size / 2));

        return (low + high) / 2;
    }

    if (mode === AVERAGE_EXP) {
        const weights = new Array(values.size)
            .fill(0)
            .map((item, key) => Math.pow(2, -(key + 1)))
            .reverse();

        const weightSum = weights.reduce((sum, value) => sum + value, 0);

        return values.reduce(
            (average, value, key) => average + value * weights[key], 0
        ) / weightSum;
    }

    // mean
    return values.reduce((sum, value) => sum + value, 0) / values.size;
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

    if (value instanceof TransactionsList) {
        return value.format();
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

    return map({
        row,
        col: -1,
        page,
        id: null,
        item: null,
        value: null,
        originalValue: null
    });
}

export function getAddDefaultValues(page, now) {
    if (!PAGES[page].list) {
        return list.of();
    }

    return list(PAGES[page].cols).map(column => {
        if (column === 'date') {
            return now;
        }
        if (column === 'cost') {
            return 0;
        }
        if (column === 'transactions') {
            return new TransactionsList(list.of(), true);
        }

        if (['item', 'category', 'shop', 'holiday', 'society'].indexOf(column) > -1) {
            return '';
        }

        return null;
    });
}

export function sortRowsByDate(rows, page, now) {
    const dateKey = PAGES[page].cols.indexOf('date');
    let lastFuture = false;

    return rows
        .sort((prev, next) => {
            const prevDate = prev.getIn(['cols', dateKey]);
            const nextDate = next.getIn(['cols', dateKey]);

            return (nextDate - prevDate) ||
                (next.get('id') - prev.get('id'));
        })
        .map(row => {
            const thisFuture = row.getIn(['cols', dateKey]) > now;
            const thisLastFuture = lastFuture;
            lastFuture = thisFuture;

            return row.set('future', thisFuture)
                .set('first-present', !thisFuture && thisLastFuture);
        });
}

export function resortListRows(page, now) {
    return state => state.setIn(['pages', page, 'rows'],
        sortRowsByDate(state.getIn(['pages', page, 'rows']), page, now));
}

