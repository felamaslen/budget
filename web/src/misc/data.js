/**
 * Data methods (using immutable objects)
 */

import { List as list, Map as map } from 'immutable';
import moment from 'moment';
import { AVERAGE_MEDIAN, AVERAGE_EXP, PAGES } from './const';
import { getNow, dateInput } from './date';

function sortByDate(prev, next) {
    if (prev.get('date') < next.get('date')) {
        return -1;
    }

    return 1;
}

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

/**
 * data type to hold transactions list for funds
 */
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
                        date: dateInput(item.date),
                        units: item.units,
                        cost: item.cost
                    });
                })
                .sort(sortByDate);

            this.size = this.list.size;
        }
        else {
            this.idCount = this.list.size;
            this.size = this.list.size;
        }
    }
    format() {
        return this.list.map(item => item.delete('id')
            .set('date', item.get('date').format('YYYY-MM-DD')))
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
        return aList.reduce((sum, item) => sum + item.get('units'), 0);
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
    getLastUnits() {
        let length = this.size;
        if (this.isSold()) {
            // don't include last item if it is a "sell"
            length--;
        }

        return TransactionsList.getUnits(this.list.slice(0, length));
    }
    getLastCost() {
        let length = this.size;
        if (this.isSold()) {
            // don't include last item if it is a "sell"
            length--;
        }

        return TransactionsList.getCost(this.list.slice(0, length));
    }
    isSold() {
        return this.getTotalUnits() === 0;
    }
}

export function dataEquals(item, compare) {
    if (item instanceof moment) {
        if (compare instanceof moment) {
            return item.isSame(compare);
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
                    listItem.get('date').isSame(compare.list.getIn([key, 'date'])) &&
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

export function getYearMonthFromKey(key, startYear, startMonth) {
    const year = startYear + Math.floor((startMonth - 1 + key) / 12);
    const month = (((startMonth + key + 11) % 12) + 12) % 12 + 1; // month is 1-indexed

    return [year, month];
}

export function getKeyFromYearMonth(year, month, startYear, startMonth) {
    return 12 * (year - startYear) + month - startMonth;
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

    if (value instanceof moment) {
        return value.format('YYYY-MM-DD');
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

export function getAddDefaultValues(page) {
    if (!PAGES[page].list) {
        return list.of();
    }

    return list(PAGES[page].cols).map(column => {
        if (column === 'date') {
            return getNow();
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

export function sortRowsByDate(rows, page) {
    const now = getNow();

    const dateKey = PAGES[page].cols.indexOf('date');
    const costKey = PAGES[page].cols.indexOf('cost');
    let lastFuture = false;

    const sorted = rows
        .sort((prev, next) => {
            const prevDate = prev.getIn(['cols', dateKey]);
            const nextDate = next.getIn(['cols', dateKey]);

            if (prevDate > nextDate) {
                return -1;
            }
            if (prevDate < nextDate) {
                return 1;
            }

            if (prev.get('id') > next.get('id')) {
                return -1;
            }

            return 1;
        })
        .map(row => {
            const thisFuture = row.getIn(['cols', dateKey]) > now;
            const thisLastFuture = lastFuture;
            lastFuture = thisFuture;

            return row
                .set('future', thisFuture)
                .set('first-present', !thisFuture && thisLastFuture);
        });

    if (PAGES[page].daily) {
        const keys = sorted.keys();
        keys.next();

        return sorted
            .reduce(({ dailySum, results }, row, id) => {
                const nextKey = keys.next().value;

                const lastInDay = nextKey &&
                    row.getIn(['cols', dateKey]) > sorted.getIn([nextKey, 'cols', dateKey]);

                const cost = row.getIn(['cols', costKey]);

                if (lastInDay) {
                    return {
                        results: results.set(id, row.set('daily', dailySum + cost)),
                        dailySum: 0
                    };
                }

                return {
                    results: results.set(id, row.delete('daily')),
                    dailySum: dailySum + cost
                };

            }, { results: sorted, dailySum: 0 })
            .results;
    }

    return sorted;
}

export function addWeeklyAverages(data, rows, page) {
    if (!PAGES[page].daily) {
        return data;
    }
    // note that this is calculated only based on the visible data,
    // not past data
    const costKey = PAGES[page].cols.indexOf('cost');
    const dateKey = PAGES[page].cols.indexOf('date');

    const visibleTotal = rows.reduce((sum, item) =>
        sum + item.getIn(['cols', costKey]), 0);

    if (!rows.size) {
        return data.set('weekly', 0);
    }
    const firstDate = rows.first().getIn(['cols', dateKey]);
    const lastDate = rows.last().getIn(['cols', dateKey]);

    const numWeeks = firstDate.diff(lastDate, 'days') / 7;

    const weeklyAverage = numWeeks
        ? visibleTotal / numWeeks
        : 0;

    return data.set('weekly', weeklyAverage);
}

