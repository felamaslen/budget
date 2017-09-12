/**
 * Process list data
 */

import { fromJS, List as list, Map as map } from 'immutable';
import {
    LIST_COLS_SHORT, LIST_COLS_STANDARD, LIST_COLS_PAGES, BLOCK_PAGES, PAGES
} from '../../misc/const';
import { YMD } from '../../misc/date';
import { TransactionsList } from '../../misc/data';
import {
    getFormattedHistory, getFundsCachedValue, getExtraRowProps
} from './funds';
import buildMessage from '../../messageBuilder';
import { EF_BLOCKS_REQUESTED } from '../../constants/effects';

export const loadBlocks = (reduction, pageIndex, noClear) => {
    if (BLOCK_PAGES.indexOf(pageIndex) === -1) {
        return reduction
            .setIn(['appState', 'other', 'blockView', 'blocks'], null);
    }
    let newReduction = reduction;
    if (!noClear) {
        newReduction = newReduction.setIn(['appState', 'other', 'blockView', 'blocks'], null);
    }
    const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);
    const table = PAGES[pageIndex];
    const loadKey = new Date().getTime();

    return newReduction.set('effects', reduction.get('effects').push(
        buildMessage(EF_BLOCKS_REQUESTED, { apiKey, table, loadKey })
    )).setIn(['appState', 'other', 'blockView', 'loadKey'], loadKey);
};

/**
 * process list page data response
 * @param {Record} reduction: app state
 * @param {integer} pageIndex: page index
 * @param {object} raw: api JSON data
 * @returns {Record} modified reduction
 */
export const processPageDataList = (reduction, pageIndex, raw) => {
    const numRows = raw.data.length;
    const numCols = LIST_COLS_PAGES[pageIndex].length;
    const total = raw.total;

    const data = map({
        numRows,
        numCols,
        total
    });

    const rows = list(raw.data.map(item => {
        const otherProps = Object.keys(item)
            .filter(
                key => LIST_COLS_STANDARD.indexOf(key) === -1
            )
            .reduce((obj, key) => {
                obj[key] = fromJS(item[key]);

                return obj;
            }, {});

        return map({
            id: item.I,
            cols: list(LIST_COLS_SHORT[pageIndex].map(col => {
                if (col === 'd') {
                    return new YMD(item[col]);
                }

                if (col === 'tr') {
                    // transactions list
                    return new TransactionsList(item.tr);
                }

                return item[col];
            })),
            ...otherProps
        });
    }));

    return loadBlocks(
        reduction.setIn(
            ['appState', 'pages', pageIndex], map({ data, rows })
        ), pageIndex
    );
};

export function processPageDataFunds(reduction, pageIndex, data, now = new Date()) {
    const startTime = data.startTime;
    const cacheTimes = list(data.cacheTimes);

    // process list-related data
    const newReduction = processPageDataList(reduction, pageIndex, data);

    const period = reduction.getIn(['appState', 'other', 'graphFunds', 'period']);
    const maxAge = Math.floor((now.getTime() / 1000) - startTime);

    const rows = newReduction.getIn(['appState', 'pages', pageIndex, 'rows']);
    const rowsWithExtraProps = getExtraRowProps(rows, startTime, cacheTimes, pageIndex);

    const mode = reduction.getIn(['appState', 'other', 'graphFunds', 'mode']);
    const zoom = reduction.getIn(['appState', 'other', 'graphFunds', 'zoom']);

    const fundsCachedValue = getFundsCachedValue(rows, startTime, cacheTimes, now, pageIndex);
    const fundHistory = getFormattedHistory(rows, mode, pageIndex, startTime, cacheTimes, zoom);

    return newReduction
        .setIn(['appState', 'pages', pageIndex, 'rows'], rowsWithExtraProps)
        .setIn(['appState', 'other', 'fundHistoryCache', period], JSON.stringify(data))
        .setIn(['appState', 'other', 'fundsCachedValue'], fundsCachedValue)
        .setIn(['appState', 'other', 'graphFunds', 'startTime'], startTime)
        .setIn(['appState', 'other', 'graphFunds', 'cacheTimes'], cacheTimes)
        .setIn(['appState', 'other', 'graphFunds', 'zoom'], list([0, maxAge]))
        .setIn(['appState', 'other', 'graphFunds', 'range'], list([0, maxAge]))
        .setIn(['appState', 'other', 'graphFunds', 'data'], fundHistory);
}

