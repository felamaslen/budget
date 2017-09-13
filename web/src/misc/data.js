/**
 * Data methods (using immutable objects)
 */

import { List as list, Map as map } from 'immutable';
import {
    AVERAGE_MEDIAN, PAGES, LIST_PAGES, LIST_COLS_PAGES, DAILY_PAGES
} from './const';
import { YMD } from './date';

const sortByDate = (a, b) => {
    if (a.get('date') < b.get('date')) {
        return -1;
    }
    return 1;
};

export const notNull = item => item !== null;

/**
 * Produce a "unique" id
 * @returns {number} "unique" id
 */
export const uuid = () => {
    return Math.floor((1 + Math.random()) * 0x10000);
};

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
                        date: new YMD(item.d),
                        units: item.u,
                        cost: item.c
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
    toString() {
        return JSON.stringify(this.list.map(item => {
            return {
                d: item.get('date').toString(),
                u: item.get('units'),
                c: item.get('cost').toString()
            };
        }).toJS());
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

/**
 * Gets the mean or median of an immutable list of values
 * @param {List} theList: immutable list
 * @param {integer} offset: don't count the last <offset> values
 * @param {integer} mode: output either median or mean
 * @returns {integer} median / mean value
 */
export const listAverage = (theList, offset, mode) => {
    const values = offset ? theList.slice(0, -offset) : theList;
    if (mode === AVERAGE_MEDIAN) {
    // median
        const sorted = values.sort((a, b) => a < b ? -1 : 1);
        if (sorted.size & 1) {
            // odd: get the middle value
            return sorted.get(Math.floor((sorted.size - 1) / 2));
        }
        // even: get the middle two values and find the average of them
        const low = sorted.get(Math.floor(sorted.size / 2) - 1);
        const high = sorted.get(Math.floor(sorted.size / 2));

        return (low + high) / 2;
    }

    // mean
    return theList.reduce((a, b) => a + b, 0) / theList.size;
};

export const indexPoints = (value, key) => [key, value];

export const getYearMonthFromKey = (key, startYear, startMonth) => {
    const year = startYear + Math.floor((startMonth - 1 + key) / 12);
    const month = (startMonth + key + 11) % 12 + 1; // month is 1-indexed
    return [year, month];
};
export const getKeyFromYearMonth = (year, month, startYear, startMonth) => {
    return 12 * (year - startYear) + month - startMonth;
};

/**
 * Generate random Gaussian increment for a brownian motion
 * Used in fund predictions
 * @returns {float} random value
 */
export const randnBm = () => {
    const u = 1 - Math.random();
    const v = 1 - Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/**
 * Builds a request list for updating the server
 * @param {Record} reduction: app state
 * @returns {string} JSON-encoded list for ajax request
 */
export const buildQueueRequestList = reduction => {
    let startYearMonth = null; // for overview updates
    const queue = reduction.getIn(['appState', 'edit', 'queue']);
    const queueDelete = reduction.getIn(['appState', 'edit', 'queueDelete']);

    // for multiple updates on the same page
    let reqListPageList = map({});

    let reqList = queue.map(dataItem => {
        const pageIndex = dataItem.get('pageIndex');
        const item = dataItem.get('item');
        const value = dataItem.get('value');

        if (PAGES[pageIndex] === 'overview') {
            if (startYearMonth === null) {
                startYearMonth = reduction.getIn(['appState', 'pages', pageIndex, 'data', 'startYearMonth']);
            }
            const key = dataItem.get('row');
            const year = startYearMonth[0] + Math.floor((key + startYearMonth[1] - 1) / 12);
            const month = (startYearMonth[1] + key - 1) % 12 + 1;
            const balance = value;

            return ['update/overview', {}, { year, month, balance }];
        }

        if (PAGES[pageIndex] === 'analysis') {
            return null; // TODO
        }

        if (LIST_PAGES.indexOf(pageIndex) > -1) {
            const id = dataItem.get('id');

            if (!reqListPageList.has(pageIndex)) {
                reqListPageList = reqListPageList.set(pageIndex, map({}));
            }
            if (!reqListPageList.get(pageIndex).has(id)) {
                reqListPageList = reqListPageList.setIn([pageIndex, id], map({}));
            }
            reqListPageList = reqListPageList.setIn(
                [pageIndex, id, item], (value.toString()));

            return null; // combine and add them later
        }

        return null;
    }).concat(queueDelete.map(dataItem => {
        return [`delete/${PAGES[dataItem.pageIndex]}`, {}, { id: dataItem.id }];
    })).filter(notNull);

    reqListPageList.forEach((item, pageIndex) => {
        item.forEach((row, id) => {
            reqList = reqList.push([`update/${PAGES[pageIndex]}`, {}, row.set('id', id).toJS()]);
        });
    });

    return JSON.stringify(reqList.toJS());
};

/**
 * @function getNullEditable
 * @param {integer} pageIndex: page we're on
 * @returns {map} null-editable object ready for navigating
 */
export const getNullEditable = pageIndex => {
    const pageIsList = LIST_PAGES.indexOf(pageIndex) > -1;
    return map({
        row: pageIsList ? -1 : 0,
        col: -1,
        pageIndex,
        id: null,
        item: null,
        value: null,
        originalValue: null
    });
};

/**
 * @function getAddDefaultValues
 * @param {integer} pageIndex: page we're on
 * @returns {list} list of add-items to display on page load
 */
export const getAddDefaultValues = pageIndex => {
    if (!LIST_COLS_PAGES[pageIndex]) {
        return list.of();
    }
    return list(LIST_COLS_PAGES[pageIndex].map(column => {
        if (column === 'date') {
            return new YMD();
        }
        if (column === 'cost') {
            return 0;
        }
        if (column === 'item' || column === 'category' || column === 'shop' ||
      column === 'holiday' || column === 'society') {
            return '';
        }
        if (column === 'transactions') {
            return new TransactionsList(list.of(), true);
        }
        return null;
    }));
};

/**
 * Sort list rows by date, and add daily tallies
 * @param {list} rows: rows to sort
 * @param {integer} pageIndex: page which rows are on
 * @returns {list} sorted rows
 */
export const sortRowsByDate = (rows, pageIndex) => {
    const today = new YMD();
    const dateKey = LIST_COLS_PAGES[pageIndex].indexOf('date');
    const costKey = LIST_COLS_PAGES[pageIndex].indexOf('cost');
    let dailySum = 0;
    let lastFuture = false;
    const sorted = rows.sort((a, b) => {
        if (a.getIn(['cols', dateKey]) > b.getIn(['cols', dateKey])) {
            return -1;
        }
        if (b.getIn(['cols', dateKey]) > (a.getIn(['cols', dateKey]))) {
            return 1;
        }
        if (a.get('id') > b.get('id')) {
            return -1;
        }
        return 1;
    }).map(row => {
        const thisFuture = row.getIn(['cols', dateKey]) > today;
        const thisLastFuture = lastFuture;
        lastFuture = thisFuture;
        return row
            .set('future', thisFuture)
            .set('first-present', !thisFuture && thisLastFuture);
    });

    if (DAILY_PAGES[pageIndex]) {
        return sorted.map((row, rowKey) => {
            const lastInDay = rowKey === sorted.size - 1 ||
        row.getIn(['cols', dateKey]) > sorted.getIn([rowKey + 1, 'cols', dateKey]);
            dailySum += row.getIn(['cols', costKey]);
            const newRow = lastInDay ? row.set('daily', dailySum) : row.delete('daily');

            if (lastInDay) {
                dailySum = 0;
            }
            return newRow;
        });
    }

    return sorted;
};

/**
 * Add weekly averages (should be run after sortRowsByDate)
 * @param {map} data: data to sort
 * @param {list} rows: rows to sort
 * @param {integer} pageIndex: page which rows are on
 * @returns {map} data with averages
 */
export const addWeeklyAverages = (data, rows, pageIndex) => {
    if (!DAILY_PAGES[pageIndex]) {
        return data;
    }
    // note that this is calculated only based on the visible data,
    // not past data
    const costKey = LIST_COLS_PAGES[pageIndex].indexOf('cost');
    const visibleTotal = rows.reduce((a, b) => {
        return a + b.getIn(['cols', costKey]);
    }, 0);

    const dateKey = LIST_COLS_PAGES[pageIndex].indexOf('date');
    if (!rows.size) {
        return data.set('weekly', 0);
    }
    const firstDate = rows.first().getIn(['cols', dateKey]);
    const lastDate = rows.last().getIn(['cols', dateKey]);
    const numWeeks = (firstDate - lastDate) / 7;

    return data.set('weekly', numWeeks ? visibleTotal / numWeeks : 0);
};

