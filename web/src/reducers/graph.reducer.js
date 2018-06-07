/*
 * Carries out actions for the graph components
 */

import { List as list, Map as map } from 'immutable';

import { getFormattedHistory, getExtraRowProps, getFundsCachedValue } from './funds.reducer';
import { processRawListRows } from './list.reducer';

import { sortRowsByDate } from '../helpers/data';

export const rToggleShowAll = state => {
    return state.setIn(
        ['other', 'showAllBalanceGraph'],
        !state.getIn(['other', 'showAllBalanceGraph']));
};

export function rToggleFundItemGraph(state, { key }) {
    return state.setIn(
        ['pages', 'funds', 'rows', key, 'historyPopout'],
        !state.getIn(['pages', 'funds', 'rows', key, 'historyPopout'])
    );
}

function getCacheData(state, period) {
    const rows = state.getIn(
        ['other', 'fundHistoryCache', period, 'rows']
    );
    const startTime = state.getIn(
        ['other', 'fundHistoryCache', period, 'startTime']
    );
    const cacheTimes = state.getIn(
        ['other', 'fundHistoryCache', period, 'cacheTimes']
    );

    return { rows, startTime, cacheTimes };
}

function getCurrentlyEnabledFunds(state) {
    return state
        .getIn(['other', 'graphFunds', 'data', 'fundItems'])
        .reduce((enabled, item, itemIndex) => {
            if (item.get('enabled')) {
                return enabled.push(itemIndex - 1);
            }

            return enabled;
        }, list.of());
}

export function rToggleFundsGraphMode(state) {
    const oldMode = state.getIn(['other', 'graphFunds', 'mode']);
    const newMode = (oldMode + 1) % 3;

    const period = state.getIn(['other', 'graphFunds', 'period']);
    const { rows, startTime, cacheTimes } = getCacheData(state, period);

    const enabledList = getCurrentlyEnabledFunds(state);

    const fundHistory = getFormattedHistory(rows, newMode, startTime, cacheTimes, enabledList);

    return state
        .setIn(['other', 'graphFunds', 'data'], fundHistory)
        .setIn(['other', 'graphFunds', 'mode'], newMode);
}

export function rToggleFundsGraphLine(state, { index }) {
    let statusBefore = false;

    let enabledList = state
        .getIn(['other', 'graphFunds', 'data', 'fundItems'])
        .reduce((enabled, item, itemIndex) => {
            if (item.get('enabled')) {
                if (itemIndex === index) {
                    statusBefore = true;

                    return enabled;
                }

                return enabled.push(itemIndex - 1);
            }

            return enabled;
        }, list.of());

    if (!(statusBefore && enabledList.size)) {
        enabledList = enabledList.push(index - 1);
    }

    const period = state.getIn(['other', 'graphFunds', 'period']);

    const { rows, startTime, cacheTimes } = getCacheData(state, period);
    const mode = state.getIn(['other', 'graphFunds', 'mode']);

    const fundHistory = getFormattedHistory(rows, mode, startTime, cacheTimes, enabledList);

    return state
        .setIn(['other', 'graphFunds', 'data'], fundHistory);
}

function changePeriod(state, period, rows, startTime, cacheTimes) {
    const mode = state.getIn(['other', 'graphFunds', 'mode']);

    // reset the zoom range when changing data
    const zoomRange = list([0, Date.now() / 1000 - startTime]);
    const enabledList = getCurrentlyEnabledFunds(state);
    const fundHistory = getFormattedHistory(rows, mode, startTime, cacheTimes, enabledList);

    return state
        .setIn(['other', 'graphFunds', 'period'], period)
        .setIn(['other', 'graphFunds', 'startTime'], startTime)
        .setIn(['other', 'graphFunds', 'cacheTimes'], cacheTimes)
        .setIn(['other', 'graphFunds', 'zoomRange'], zoomRange)
        .setIn(['other', 'graphFunds', 'data'], fundHistory);
}

export function rHandleFundPeriodResponse(state, { reloadPagePrices, shortPeriod, data }) {
    const { sortedRows, rowIds } = sortRowsByDate(processRawListRows(data.data, 'funds'), 'funds');
    const startTime = data.startTime;
    const cacheTimes = list(data.cacheTimes);

    const nextState = changePeriod(state, shortPeriod, sortedRows, startTime, cacheTimes)
        .setIn(['other', 'fundHistoryCache', shortPeriod], map({
            rows: sortedRows, startTime, cacheTimes
        }));

    if (reloadPagePrices) {
        const rowsWithExtraProps = getExtraRowProps(sortedRows, startTime, cacheTimes);

        const fundsCachedValue = getFundsCachedValue(sortedRows, startTime, cacheTimes, new Date());

        return nextState
            .setIn(['pages', 'funds', 'rows'], rowsWithExtraProps)
            .setIn(['pages', 'funds', 'rowIds'], rowIds)
            .setIn(['other', 'fundsCachedValue'], fundsCachedValue);
    }

    return nextState;
}

export function rChangeFundsGraphPeriod(state, { shortPeriod, noCache }) {
    const loadFromCache = !noCache && state
        .getIn(['other', 'fundHistoryCache'])
        .has(shortPeriod);

    if (!loadFromCache) {
        // the side effect will change the period when the content is loaded
        return state;
    }

    const theShortPeriod = shortPeriod || state.getIn(['other', 'graphFunds', 'period']);

    const { rows, startTime, cacheTimes } = getCacheData(state, theShortPeriod);

    return changePeriod(state, shortPeriod, rows, startTime, cacheTimes);
}

