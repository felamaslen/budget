/*
 * Carries out actions for the graph components
 */

import { List as list, Map as map } from 'immutable';

import { getFormattedHistory, getExtraRowProps, getFundsCachedValue } from './funds.reducer';
import { processRawListRows } from './list.reducer';

import { sortRowsByDate } from '../helpers/data';

export const rToggleShowAll = reduction => {
    return reduction.setIn(
        ['other', 'showAllBalanceGraph'],
        !reduction.getIn(['other', 'showAllBalanceGraph']));
};

export function rToggleFundItemGraph(reduction, { key }) {
    return reduction.setIn(
        ['pages', 'funds', 'rows', key, 'historyPopout'],
        !reduction.getIn(['pages', 'funds', 'rows', key, 'historyPopout'])
    );
}

function getCacheData(reduction, period) {
    const rows = reduction.getIn(
        ['other', 'fundHistoryCache', period, 'rows']
    );
    const startTime = reduction.getIn(
        ['other', 'fundHistoryCache', period, 'startTime']
    );
    const cacheTimes = reduction.getIn(
        ['other', 'fundHistoryCache', period, 'cacheTimes']
    );

    return { rows, startTime, cacheTimes };
}

function getCurrentlyEnabledFunds(reduction) {
    return reduction
        .getIn(['other', 'graphFunds', 'data', 'fundItems'])
        .reduce((enabled, item, itemIndex) => {
            if (item.get('enabled')) {
                return enabled.push(itemIndex - 1);
            }

            return enabled;
        }, list.of());
}

export function rToggleFundsGraphMode(reduction) {
    const oldMode = reduction.getIn(['other', 'graphFunds', 'mode']);
    const newMode = (oldMode + 1) % 3;

    const period = reduction.getIn(['other', 'graphFunds', 'period']);
    const { rows, startTime, cacheTimes } = getCacheData(reduction, period);

    const enabledList = getCurrentlyEnabledFunds(reduction);

    const fundHistory = getFormattedHistory(rows, newMode, startTime, cacheTimes, enabledList);

    return reduction
        .setIn(['other', 'graphFunds', 'data'], fundHistory)
        .setIn(['other', 'graphFunds', 'mode'], newMode);
}

export function rToggleFundsGraphLine(reduction, { index }) {
    let statusBefore = false;

    let enabledList = reduction
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

    const period = reduction.getIn(['other', 'graphFunds', 'period']);

    const { rows, startTime, cacheTimes } = getCacheData(reduction, period);
    const mode = reduction.getIn(['other', 'graphFunds', 'mode']);

    const fundHistory = getFormattedHistory(rows, mode, startTime, cacheTimes, enabledList);

    return reduction
        .setIn(['other', 'graphFunds', 'data'], fundHistory);
}

function changePeriod(reduction, period, rows, startTime, cacheTimes) {
    const mode = reduction.getIn(['other', 'graphFunds', 'mode']);

    // reset the zoom range when changing data
    const zoomRange = list([0, Date.now() / 1000 - startTime]);
    const enabledList = getCurrentlyEnabledFunds(reduction);
    const fundHistory = getFormattedHistory(rows, mode, startTime, cacheTimes, enabledList);

    return reduction
        .setIn(['other', 'graphFunds', 'period'], period)
        .setIn(['other', 'graphFunds', 'startTime'], startTime)
        .setIn(['other', 'graphFunds', 'cacheTimes'], cacheTimes)
        .setIn(['other', 'graphFunds', 'zoomRange'], zoomRange)
        .setIn(['other', 'graphFunds', 'data'], fundHistory);
}

export function rHandleFundPeriodResponse(reduction, { reloadPagePrices, shortPeriod, data }) {
    const { sortedRows, rowIds } = sortRowsByDate(processRawListRows(data.data, 'funds'), 'funds');
    const startTime = data.startTime;
    const cacheTimes = list(data.cacheTimes);

    const newReduction = changePeriod(reduction, shortPeriod, sortedRows, startTime, cacheTimes)
        .setIn(['other', 'fundHistoryCache', shortPeriod], map({
            rows: sortedRows, startTime, cacheTimes
        }));

    if (reloadPagePrices) {
        const rowsWithExtraProps = getExtraRowProps(sortedRows, startTime, cacheTimes);

        const fundsCachedValue = getFundsCachedValue(sortedRows, startTime, cacheTimes, new Date());

        return newReduction
            .setIn(['pages', 'funds', 'rows'], rowsWithExtraProps)
            .setIn(['pages', 'funds', 'rowIds'], rowIds)
            .setIn(['other', 'fundsCachedValue'], fundsCachedValue);
    }

    return newReduction;
}

export function rChangeFundsGraphPeriod(reduction, { shortPeriod, noCache }) {
    const loadFromCache = !noCache && reduction
        .getIn(['other', 'fundHistoryCache'])
        .has(shortPeriod);

    if (!loadFromCache) {
        // the side effect will change the period when the content is loaded
        return reduction;
    }

    const theShortPeriod = shortPeriod || reduction.getIn(['other', 'graphFunds', 'period']);

    const { rows, startTime, cacheTimes } = getCacheData(reduction, theShortPeriod);

    return changePeriod(reduction, shortPeriod, rows, startTime, cacheTimes);
}

