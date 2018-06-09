/*
 * Carries out actions for the graph components
 */

import { List as list, Map as map } from 'immutable';

import { getInitialEnabledList, processPrices } from './funds.reducer';

export const rToggleShowAll = state => {
    return state.setIn(
        ['other', 'showAllBalanceGraph'],
        !state.getIn(['other', 'showAllBalanceGraph']));
};

export function rToggleFundsGraphMode(state) {
    return state.setIn(['other', 'graphFunds', 'mode'],
        (state.getIn(['other', 'graphFunds', 'mode']) + 1) % 3);
}

export function rToggleFundsGraphLine(state, { index }) {
    const enabledList = state.getIn(['other', 'graphFunds', 'enabledList'])
        .set(index, !state.getIn(['other', 'graphFunds', 'enabledList', index]));

    const numEnabled = enabledList.reduce((num, item) => num + (item >> 0), 0);
    if (!numEnabled) {
        return state;
    }

    return state.setIn(['other', 'graphFunds', 'enabledList'], enabledList);
}

function changePeriod(state, period) {
    const now = state.get('now');
    const startTime = state.getIn(['pages', 'funds', 'cache', period, 'startTime']);

    // reset the zoom range when changing data
    const zoomRange = list([0, now.ts / 1000 - startTime]);

    return state.setIn(['other', 'graphFunds', 'period'], period)
        .setIn(['other', 'graphFunds', 'zoomRange'], zoomRange);
}

export function rHandleFundPeriodResponse(state, { shortPeriod, res }) {
    const startTime = res.startTime;
    const cacheTimes = list(res.cacheTimes);
    const prices = processPrices(res.data);

    const stateWithCache = state.setIn(['pages', 'funds', 'cache', shortPeriod],
        map({ prices, startTime, cacheTimes })
    )
        .setIn(['other', 'graphFunds', 'enabledList'], getInitialEnabledList(prices));

    return changePeriod(stateWithCache, shortPeriod);
}

export function rChangeFundsGraphPeriod(state, { shortPeriod, noCache }) {
    const loadFromCache = !noCache && state.getIn(['pages', 'funds']) &&
        state.getIn(['pages', 'funds', 'cache']).has(shortPeriod);

    if (!loadFromCache) {
        // data refresh handled from a saga

        return state;
    }

    return changePeriod(state, shortPeriod || state.getIn(['other', 'graphFunds', 'period']));
}

