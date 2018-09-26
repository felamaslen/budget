/**
 * Process funds data
 */

import { List as list, Map as map, OrderedMap as orderedMap } from 'immutable';
import { DATA_KEY_ABBR } from '../constants/data';
import { GRAPH_FUNDS_OVERALL_ID } from '../constants/graph';
import { sortRowsByDate } from '../helpers/data';
import { getRowLengths } from '../selectors/funds/helpers';
import { getNow } from '../selectors/app';
import { processRawListRows } from './list.reducer';

export function getInitialEnabledList(prices) {
    const { rowLengths, maxLength } = getRowLengths(prices);

    return rowLengths.reduce((keys, length, id) =>
        keys.set(id, length >= maxLength), orderedMap({ [GRAPH_FUNDS_OVERALL_ID]: true }));
}

export function processPrices(rowsRaw) {
    return map(rowsRaw.map(({ [DATA_KEY_ABBR.id]: id, pr, prStartIndex }) => ([
        id,
        map({
            values: list(pr),
            startIndex: prStartIndex
        })
    ])));
}

export function processPageDataFunds(state, { raw }) {
    const startTime = raw.startTime;
    const cacheTimes = list(raw.cacheTimes);

    const period = state.getIn(['other', 'graphFunds', 'period']);
    const maxAge = Math.floor((getNow(state).ts / 1000) - startTime);

    const sortedRows = sortRowsByDate(processRawListRows(raw.data, 'funds'), 'funds', state.get('now'));

    const prices = processPrices(raw.data);

    return state.setIn(['pages', 'funds', 'rows'], sortedRows)
        .setIn(['pages', 'funds', 'cache'], map({
            [period]: map({ startTime, cacheTimes, prices })
        }))
        .setIn(['other', 'graphFunds', 'zoomRange'], list([0, maxAge]))
        .setIn(['other', 'graphFunds', 'enabledList'], getInitialEnabledList(prices));
}

