/**
 * Process list data
 */

import { fromJS, List as list, Map as map } from 'immutable';
import {
    LIST_COLS_SHORT, LIST_COLS_STANDARD, LIST_COLS_PAGES
} from '../../misc/const';
import { YMD } from '../../misc/date';
import { TransactionsList, sortRowsByDate } from '../../misc/data';
import {
    getFormattedHistory, getFundsCachedValue, getExtraRowProps
} from './funds';

export function processRawListRows(data, pageIndex) {
    return map(data.map(item => {
        const id = item.I;

        const otherProps = Object.keys(item)
            .filter(
                key => LIST_COLS_STANDARD.indexOf(key) === -1
            )
            .reduce((obj, key) => {
                obj[key] = fromJS(item[key]);

                return obj;
            }, {});

        const cols = list(LIST_COLS_SHORT[pageIndex].map(col => {
            if (col === 'd') {
                return new YMD(item[col]);
            }

            if (col === 'tr') {
                // transactions list
                return new TransactionsList(item.tr);
            }

            return item[col];
        }));

        return [id, map({ id, cols, ...otherProps })];
    }));
}

/**
 * process list page data response
 * @param {Record} reduction: app state
 * @param {integer} pageIndex: page index
 * @param {object} raw: api JSON data
 * @returns {Record} modified reduction
 */
export function processPageDataList(reduction, pageIndex, raw) {
    const numRows = raw.data.length;
    const numCols = LIST_COLS_PAGES[pageIndex].length;
    const total = raw.total;

    const data = map({ numRows, numCols, total });

    const rows = processRawListRows(raw.data, pageIndex);

    return reduction.setIn(
        ['pages', pageIndex], map({ data, rows })
    );
}

export function processPageDataFunds(reduction, pageIndex, data, now = new Date()) {
    const startTime = data.startTime;
    const cacheTimes = list(data.cacheTimes);

    // process list-related data
    const newReduction = processPageDataList(reduction, pageIndex, data);

    const period = reduction.getIn(['other', 'graphFunds', 'period']);
    const maxAge = Math.floor((now.getTime() / 1000) - startTime);

    const rows = sortRowsByDate(
        newReduction.getIn(['pages', pageIndex, 'rows']), pageIndex
    );
    const rowsWithExtraProps = getExtraRowProps(rows, startTime, cacheTimes, pageIndex);

    const mode = reduction.getIn(['other', 'graphFunds', 'mode']);
    const zoom = reduction.getIn(['other', 'graphFunds', 'zoom']);

    const fundsCachedValue = getFundsCachedValue(rows, startTime, cacheTimes, now, pageIndex);
    const fundHistory = getFormattedHistory(rows, mode, pageIndex, startTime, cacheTimes, zoom);

    return newReduction
        .setIn(['pages', pageIndex, 'rows'], rowsWithExtraProps)
        .setIn(['pages', pageIndex, 'startTime'], startTime)
        .setIn(['pages', pageIndex, 'cacheTimes'], cacheTimes)
        .setIn(
            ['other', 'fundHistoryCache', period],
            map({ rows, startTime, cacheTimes })
        )
        .setIn(['other', 'fundsCachedValue'], fundsCachedValue)
        .setIn(['other', 'graphFunds', 'startTime'], startTime)
        .setIn(['other', 'graphFunds', 'cacheTimes'], cacheTimes)
        .setIn(['other', 'graphFunds', 'zoom'], list([0, maxAge]))
        .setIn(['other', 'graphFunds', 'range'], list([0, maxAge]))
        .setIn(['other', 'graphFunds', 'data'], fundHistory);
}

