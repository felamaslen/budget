/*
 * Carries out actions for the graph components
 */

import { List as list, Map as map } from 'immutable';
import buildMessage from '../messageBuilder';
import { EF_FUNDS_PERIOD_REQUESTED } from '../constants/effects';
import { PAGES, GRAPH_ZOOM_MAX, GRAPH_ZOOM_SPEED } from '../misc/const';
import { getPeriodMatch } from '../misc/data';
import {
    getFormattedHistory,
    zoomFundLines,
    getExtraRowProps,
    getFundsCachedValue
} from './data/funds';
import {
    processRawListRows
} from './data/list';
import { rgba } from '../misc/color';

const pageIndexFunds = PAGES.indexOf('funds');

export const rToggleShowAll = reduction => {
    return reduction.setIn(
        ['other', 'showAllBalanceGraph'],
        !reduction.getIn(['other', 'showAllBalanceGraph']));
};

export function rToggleFundItemGraph(reduction, key) {
    return reduction.setIn(
        ['pages', pageIndexFunds, 'rows', key, 'historyPopout'],
        !reduction.getIn(['pages', pageIndexFunds, 'rows', key, 'historyPopout'])
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

    const fundHistory = getFormattedHistory(
        rows, newMode, pageIndexFunds, startTime, cacheTimes, zoom, enabledList
    );

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

export function rHoverFundsGraph(reduction, position) {
    if (!position) {
        return reduction.setIn(['other', 'graphFunds', 'hlPoint'], null);
    }

    const lines = reduction.getIn(['other', 'graphFunds', 'data', 'fundLines']);

    if (!lines || !lines.size) {
        return reduction;
    }

    const closest = lines.reduce((last, line, lineKey) => {
        return line
            .get('line')
            .reduce((thisLast, point, pointKey) => {
                const pointDistance = Math.sqrt(
                    Math.pow((point.get(0) - position.valX) / 1000, 2) +
                    Math.pow(point.get(1) - position.valY, 2)
                );

                if (pointDistance < thisLast.dist) {
                    thisLast.dist = pointDistance;
                    thisLast.lineKey = lineKey;
                    thisLast.pointKey = pointKey;
                }

                return thisLast;
            }, last);

    }, { dist: Infinity, lineKey: null, pointKey: null });

    const lineIndex = reduction.getIn(
        ['other', 'graphFunds', 'data', 'fundLines', closest.lineKey, 'index']
    );

    const color = reduction.getIn(
        ['other', 'graphFunds', 'data', 'fundItems', lineIndex, 'color']
    );

    let hlPoint = lines
        .getIn([closest.lineKey, 'line', closest.pointKey]);

    if (hlPoint) {
        hlPoint = hlPoint.push(rgba(color));
    }

    return reduction.setIn(
        ['other', 'graphFunds', 'hlPoint'], hlPoint
    );
}

export function rToggleFundsGraphLine(reduction, index) {
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

    if (!statusBefore || !enabledList.size) {
        enabledList = enabledList.push(index - 1);
    }

    const zoom = reduction.getIn(['other', 'graphFunds', 'zoom']);
    const period = reduction.getIn(['other', 'graphFunds', 'period']);

    const { rows, startTime, cacheTimes } = getCacheData(reduction, period);
    const mode = reduction.getIn(['other', 'graphFunds', 'mode'])

    const fundHistory = getFormattedHistory(
        rows, mode, pageIndexFunds, startTime, cacheTimes, zoom, enabledList
    );

    return reduction
        .setIn(['other', 'graphFunds', 'data'], fundHistory)
}

function changePeriod(reduction, period, rows, startTime, cacheTimes) {
    const mode = reduction.getIn(['other', 'graphFunds', 'mode']);

    // reset the zoom when changing data
    const zoom = list([0, new Date().getTime() / 1000 - startTime]);

    const enabledList = getCurrentlyEnabledFunds(reduction);

    const fundHistory = getFormattedHistory(
        rows, mode, pageIndexFunds, startTime, cacheTimes, zoom, enabledList
    );

    return reduction
        .setIn(['other', 'graphFunds', 'period'], period)
        .setIn(['other', 'graphFunds', 'startTime'], startTime)
        .setIn(['other', 'graphFunds', 'cacheTimes'], cacheTimes)
        .setIn(['other', 'graphFunds', 'zoom'], zoom)
        .setIn(['other', 'graphFunds', 'range'], zoom.slice())
        .setIn(['other', 'graphFunds', 'data'], fundHistory);
}

export function rHandleFundPeriodResponse(reduction, response) {
    const rows = processRawListRows(response.data.data, pageIndexFunds);
    const startTime = response.data.startTime;
    const cacheTimes = list(response.data.cacheTimes);

    const newReduction = changePeriod(
        reduction.setIn(
            ['other', 'fundHistoryCache', response.period],
            map({ rows, startTime, cacheTimes })
        ),
        response.period,
        rows,
        startTime,
        cacheTimes
    );

    if (response.reloadPagePrices) {
        const rowsWithExtraProps = getExtraRowProps(
            rows, startTime, cacheTimes, pageIndexFunds
        );

        const fundsCachedValue = getFundsCachedValue(
            rows, startTime, cacheTimes, new Date(), pageIndexFunds
        );

        return newReduction
            .setIn(['pages', pageIndexFunds, 'rows'], rowsWithExtraProps)
            .setIn(['other', 'fundsCachedValue'], fundsCachedValue);
    }

    return newReduction;
}

export function rChangeFundsGraphPeriod(reduction, req) {
    const shortPeriod = req.period || reduction.getIn(
        ['other', 'graphFunds', 'period']
    );

    const { period, length } = getPeriodMatch(shortPeriod);

    if (req.noCache || !reduction.getIn(
        ['other', 'fundHistoryCache']
    ).has(shortPeriod)) {

        const apiKey = reduction.getIn(['user', 'apiKey']);
        const reloadPagePrices = Boolean(req.reloadPagePrices);

        return reduction.set(
            'effects', reduction.get('effects').push(
                buildMessage(EF_FUNDS_PERIOD_REQUESTED, {
                    apiKey,
                    period,
                    length,
                    reloadPagePrices
                })
            )
        );
    }

    const { rows, startTime, cacheTimes } = getCacheData(reduction, shortPeriod);

    return changePeriod(reduction, shortPeriod, rows, startTime, cacheTimes);
}

