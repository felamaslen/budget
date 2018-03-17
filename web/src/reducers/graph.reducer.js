/*
 * Carries out actions for the graph components
 */

import { List as list, Map as map } from 'immutable';

import {
    getFormattedHistory, zoomFundLines, getExtraRowProps, getFundsCachedValue
} from './funds.reducer';
import { processRawListRows } from './list.reducer';

import { GRAPH_ZOOM_MAX, GRAPH_ZOOM_SPEED } from '../misc/const';
import { sortRowsByDate } from '../misc/data';
import { rgba } from '../misc/color';

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

    const zoom = reduction.getIn(['other', 'graphFunds', 'zoom']);
    const period = reduction.getIn(['other', 'graphFunds', 'period']);
    const { rows, startTime, cacheTimes } = getCacheData(reduction, period);

    const enabledList = getCurrentlyEnabledFunds(reduction);

    const fundHistory = getFormattedHistory(rows, newMode, startTime, cacheTimes, zoom, enabledList);

    return reduction
        .setIn(['other', 'graphFunds', 'data'], fundHistory)
        .setIn(['other', 'graphFunds', 'mode'], newMode);
}

function numFundPointsVisible(lines, minX, maxX) {
    return lines.reduce((sum, line) => {
        return Math.max(sum, line
            .get('line')
            .filter(item => {
                const xValue = item.get(0);

                return xValue >= minX && xValue <= maxX;
            })
            .size
        );
    }, 0);
}

export function rZoomFundsGraph(reduction, obj) {
    // direction: in is negative, out is positive
    const range = reduction.getIn(['other', 'graphFunds', 'range']);
    const zoom = reduction.getIn(['other', 'graphFunds', 'zoom']);
    const lines = reduction.getIn(['other', 'graphFunds', 'data', 'fundLines']);
    const linesAll = reduction.getIn(
        ['other', 'graphFunds', 'data', 'fundLinesAll']
    );

    const newRangeWidth = Math.min(range.last() - range.first(), Math.max(
        (range.last() - range.first()) * GRAPH_ZOOM_MAX,
        (zoom.last() - zoom.first()) * (1 + GRAPH_ZOOM_SPEED * obj.direction)
    ));

    let newMinXTarget = obj.position - newRangeWidth / 2;
    let newMaxXTarget = obj.position + newRangeWidth / 2;
    if (newMinXTarget < range.first()) {
        newMaxXTarget += range.first() - newMinXTarget;
        newMinXTarget = range.first();
    }
    else if (newMaxXTarget > range.last()) {
        newMinXTarget -= newMaxXTarget - range.last();
        newMaxXTarget = range.last();
    }

    const newMinX = Math.max(range.first(), Math.round(newMinXTarget));
    const newMaxX = Math.min(range.last(), Math.round(newMaxXTarget));
    const newZoom = list([newMinX, newMaxX]);

    if (numFundPointsVisible(lines, newZoom.get(0), newZoom.get(1)) < 4) {
        return reduction;
    }

    const zoomedLines = zoomFundLines(linesAll, newZoom);

    return reduction
        .setIn(['other', 'graphFunds', 'zoom'], newZoom)
        .setIn(['other', 'graphFunds', 'data', 'fundLines'], zoomedLines);
}

export function rHoverFundsGraph(reduction, { position }) {
    if (!position) {
        return reduction.setIn(['other', 'graphFunds', 'hlPoint'], null);
    }

    const lines = reduction.getIn(['other', 'graphFunds', 'data', 'fundLines']);

    if (!(lines && lines.size)) {
        return reduction;
    }

    const closest = lines.reduce((last, line) => {
        const lineIndex = line.get('index');
        const prices = line.get('prices');

        return line.get('line')
            .filterNot((point, pointKey) => prices && prices.get(pointKey) === 0)
            .reduce(({ dist: lastDist, lineIndex: lastIndex, point: lastPoint }, point) => {
                const dist = (
                    ((point.get(0) - position.valX) / 1000) ** 2 +
                    ((point.get(1) - position.valY) / 100) ** 2
                ) ** 0.5;

                if (dist < lastDist) {
                    return { dist, lineIndex, point };
                }

                return { dist: lastDist, lineIndex: lastIndex, point: lastPoint };

            }, last);
    }, { dist: Infinity });

    const color = reduction.getIn(['other', 'graphFunds', 'data', 'fundItems', closest.lineIndex, 'color']);

    const hlPoint = closest.point
        ? closest.point.set(2, rgba(color))
        : null;

    return reduction.setIn(['other', 'graphFunds', 'hlPoint'], hlPoint);
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

    const zoom = reduction.getIn(['other', 'graphFunds', 'zoom']);
    const period = reduction.getIn(['other', 'graphFunds', 'period']);

    const { rows, startTime, cacheTimes } = getCacheData(reduction, period);
    const mode = reduction.getIn(['other', 'graphFunds', 'mode']);

    const fundHistory = getFormattedHistory(rows, mode, startTime, cacheTimes, zoom, enabledList);

    return reduction
        .setIn(['other', 'graphFunds', 'data'], fundHistory);
}

function changePeriod(reduction, period, rows, startTime, cacheTimes) {
    const mode = reduction.getIn(['other', 'graphFunds', 'mode']);

    // reset the zoom when changing data
    const zoom = list([0, new Date().getTime() / 1000 - startTime]);

    const enabledList = getCurrentlyEnabledFunds(reduction);

    const fundHistory = getFormattedHistory(rows, mode, startTime, cacheTimes, zoom, enabledList);

    return reduction
        .setIn(['other', 'graphFunds', 'period'], period)
        .setIn(['other', 'graphFunds', 'startTime'], startTime)
        .setIn(['other', 'graphFunds', 'cacheTimes'], cacheTimes)
        .setIn(['other', 'graphFunds', 'zoom'], zoom)
        .setIn(['other', 'graphFunds', 'range'], zoom.slice())
        .setIn(['other', 'graphFunds', 'data'], fundHistory);
}

export function rHandleFundPeriodResponse(reduction, { reloadPagePrices, shortPeriod, data }) {
    const rows = sortRowsByDate(processRawListRows(data.data, 'funds'), 'funds');
    const startTime = data.startTime;
    const cacheTimes = list(data.cacheTimes);

    const newReduction = changePeriod(
        reduction, shortPeriod, rows, startTime, cacheTimes
    )
        .setIn(['other', 'fundHistoryCache', shortPeriod], map({
            rows, startTime, cacheTimes
        }));

    if (reloadPagePrices) {
        const rowsWithExtraProps = getExtraRowProps(rows, startTime, cacheTimes);

        const fundsCachedValue = getFundsCachedValue(rows, startTime, cacheTimes, new Date());

        return newReduction
            .setIn(['pages', 'funds', 'rows'], rowsWithExtraProps)
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

