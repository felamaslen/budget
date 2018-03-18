/**
 * Process list data
 */

import { fromJS, List as list, Map as map } from 'immutable';

import { getFormattedHistory, getFundsCachedValue, getExtraRowProps } from './funds.reducer';
import { PAGES, DATA_KEY_ABBR } from '../constants/data';
import { dateInput } from '../misc/date';
import { TransactionsList, sortRowsByDate } from '../misc/data';

export function processRawListRows(data, page) {
    return map(data.map(item => {
        const id = item[DATA_KEY_ABBR.id];

        const dataKeyAbbr = list(Object.values(DATA_KEY_ABBR));

        const otherProps = list(Object.keys(item))
            .filterNot(key => dataKeyAbbr.includes(key))
            .reduce((result, key) => ({ ...result, [key]: fromJS(item[key]) }), {});

        const cols = list(PAGES[page].cols).map(col => {
            const value = item[DATA_KEY_ABBR[col]];

            if (col === 'date') {
                return dateInput(value, false);
            }

            if (col === 'transactions') {
                // transactions list
                return new TransactionsList(value);
            }

            return value;
        });

        return [id, map({ id, cols, ...otherProps })];
    }));
}

/**
 * process list page data response
 * @param {Record} reduction: app state
 * @param {string} page: page to process
 * @param {object} raw: api JSON data
 * @returns {Record} modified reduction
 */
export function processPageDataList(reduction, { page, raw }) {
    const numRows = raw.data.length;
    const numCols = PAGES[page].cols.length;
    const total = raw.total;

    const data = map({ numRows, numCols, total });

    const rows = processRawListRows(raw.data, page);

    return reduction.setIn(['pages', page], map({ data, rows }));
}

export function processPageDataFunds(reduction, { raw }, now) {
    const startTime = raw.startTime;
    const cacheTimes = list(raw.cacheTimes);

    // process list-related data
    const newReduction = processPageDataList(reduction, { page: 'funds', raw });

    const period = reduction.getIn(['other', 'graphFunds', 'period']);
    const maxAge = Math.floor((now.getTime() / 1000) - startTime);

    const rows = sortRowsByDate(newReduction.getIn(['pages', 'funds', 'rows']), 'funds');
    const rowsWithExtraProps = getExtraRowProps(rows, startTime, cacheTimes);

    const mode = reduction.getIn(['other', 'graphFunds', 'mode']);
    const zoom = reduction.getIn(['other', 'graphFunds', 'zoom']);

    const fundsCachedValue = getFundsCachedValue(rows, startTime, cacheTimes, now);
    const fundHistory = getFormattedHistory(rows, mode, startTime, cacheTimes, zoom);

    return newReduction
        .setIn(['pages', 'funds', 'rows'], rowsWithExtraProps)
        .setIn(['pages', 'funds', 'startTime'], startTime)
        .setIn(['pages', 'funds', 'cacheTimes'], cacheTimes)
        .setIn(['other', 'fundHistoryCache', period], map({ rows, startTime, cacheTimes }))
        .setIn(['other', 'fundsCachedValue'], fundsCachedValue)
        .setIn(['other', 'graphFunds', 'startTime'], startTime)
        .setIn(['other', 'graphFunds', 'cacheTimes'], cacheTimes)
        .setIn(['other', 'graphFunds', 'zoom'], list([0, maxAge]))
        .setIn(['other', 'graphFunds', 'range'], list([0, maxAge]))
        .setIn(['other', 'graphFunds', 'data'], fundHistory);
}

