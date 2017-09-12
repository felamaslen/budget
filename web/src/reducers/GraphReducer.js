/*
 * Carries out actions for the graph components
 */

import { fromJS, List as list, Map as map } from 'immutable';
import buildMessage from '../messageBuilder';
import { EF_FUNDS_PERIOD_REQUESTED } from '../constants/effects';
import { PAGES, LIST_COLS_PAGES, GRAPH_ZOOM_MAX, GRAPH_ZOOM_SPEED } from '../misc/const';
import {
    getFormattedHistory,
    zoomFundLines, addFundLines, getXRange, getFundsCachedValue,
    getFundsWithTransactions, getFundLines, getGainComparisons, addPriceHistory
} from './data/funds';

const pageIndexFunds = PAGES.indexOf('funds');

export const rToggleShowAll = reduction => {
    return reduction.setIn(
        ['appState', 'other', 'showAllBalanceGraph'],
        !reduction.getIn(['appState', 'other', 'showAllBalanceGraph']));
};

export const rToggleFundItemGraph = (reduction, key) => {
    return reduction.setIn(
        ['appState', 'pages', pageIndexFunds, 'rows', key, 'historyPopout'],
        !reduction.getIn(['appState', 'pages', pageIndexFunds, 'rows', key, 'historyPopout'])
    );
};

function reloadFundHistory(reduction, mode = null, enabledList = null) {
    const newMode = typeof mode === 'undefined'
        ? reduction.getIn(['appState', 'other', 'graphFunds', 'mode'])
        : mode;

    const rows = reduction.getIn(['appState', 'pages', pageIndexFunds, 'rows']);
    const startTime = reduction.getIn(['appState', 'other', 'graphFunds', 'startTime']);
    const cacheTimes = reduction.getIn(['appState', 'other', 'graphFunds', 'cacheTimes']);

    return getFormattedHistory(
        rows, newMode, pageIndexFunds, startTime, cacheTimes, enabledList
    );
}

export function rToggleFundsGraphMode(reduction) {
    const oldMode = reduction.getIn(['appState', 'other', 'graphFunds', 'mode']);
    const newMode = (oldMode + 1) % 3;

    const fundHistory = reloadFundHistory(reduction, newMode);

    return reduction
        .setIn(['appState', 'other', 'graphFunds', 'data'], fundHistory)
        .setIn(['appState', 'other', 'graphFunds', 'mode'], newMode);
}

const numFundPointsVisible = (lines, minX, maxX) => {
    return lines.reduce((last, line) => {
        return Math.max(last, line.last().filter(item => {
            const xValue = item.first();
            return xValue >= minX && xValue <= maxX;
        }).size);
    }, 0);
};

export const rZoomFundsGraph = (reduction, obj) => {
    // direction: in is negative, out is positive
    const range = reduction.getIn(['appState', 'other', 'graphFunds', 'range']);
    const zoom = reduction.getIn(['appState', 'other', 'graphFunds', 'zoom']);
    const lines = reduction.getIn(['appState', 'pages', pageIndexFunds, 'lines']);

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

    const newReduction = reduction
        .setIn(['appState', 'other', 'graphFunds', 'zoom'], newZoom);

    return newReduction.setIn(
        ['appState', 'pages', pageIndexFunds, 'lines'],
        zoomFundLines(newReduction.getIn(['appState', 'pages', pageIndexFunds, 'linesAll']), newReduction)
    );
};

export function rHoverFundsGraph(reduction, position) {
    if (!position) {
        return reduction.setIn(['appState', 'other', 'graphFunds', 'hlPoint'], null);
    }

    const lines = reduction.getIn(['appState', 'other', 'graphFunds', 'data', 'fundLines']);

    if (!lines || !lines.size) {
        return reduction;
    }

    const closest = lines.reduce((last, line, lineKey) => {
        return line
            .get('line')
            .reduce((thisLast, point, pointKey) => {
                const pointDistance = Math.sqrt(
                    Math.pow(point.get(0) - position.valX, 2) +
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

    const color = reduction.getIn([
        'appState', 'other', 'graphFunds', 'data', 'fundItems', closest.lineKey, 'color'
    ]);

    const hlPoint = lines
        .getIn([closest.lineKey, 'line', closest.pointKey])
        .push(color);

    return reduction.setIn(
        ['appState', 'other', 'graphFunds', 'hlPoint'], hlPoint
    );
}

export function rToggleFundsGraphLine(reduction, index) {
    let statusBefore = false;

    let enabledList = reduction
        .getIn(['appState', 'other', 'graphFunds', 'data', 'fundItems'])
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

    const fundHistory = reloadFundHistory(reduction, null, enabledList);

    return reduction
        .setIn(['appState', 'other', 'graphFunds', 'data'], fundHistory)
}

export const rHandleFundPeriodResponse = (reduction, response, fromCache) => {
    let newReduction = reduction;
    if (!fromCache) {
        newReduction = newReduction.setIn(
            ['appState', 'other', 'fundHistoryCache', response.period], response.data);
    }
    const transactionsKey = LIST_COLS_PAGES[pageIndexFunds].indexOf('transactions');
    const history = fromJS(response.data.data.data);

    const oldData = reduction.getIn(['appState', 'pages', pageIndexFunds]);
    const newFunds = getFundsWithTransactions(history, oldData.get('rows'), pageIndexFunds);
    const oldFundLines = oldData.get('fundLines');
    const newFundsItems = history.getIn(['funds', 'items']);
    const newOldFundLines = map(oldFundLines.filter(fundLine => {
        return newFundsItems.indexOf(fundLine.get('item')) > -1;
    }).map(fundLine=> list([fundLine.get('item'), fundLine])));
    const fundsEnabled = newFunds.map(() => null); // enabled set by replace method
    const overallEnabled = oldFundLines.first().get('enabled');
    const newFundLines = getFundLines(newFunds, fundsEnabled, overallEnabled, (fund, fundLine) => {
        if (newOldFundLines.has(fund.item)) {
            return newOldFundLines.get(fund.item);
        }
        return fundLine;
    });
    const oldRows = oldData.get('rows');
    const newRows = getGainComparisons(oldRows.map(row => {
        return addPriceHistory(pageIndexFunds, row, history, row.getIn(['cols', transactionsKey]));
    }));

    const newData = oldData
        .set('history', history)
        .set('funds', newFunds)
        .set('fundLines', newFundLines)
        .set('rows', newRows);

    newReduction = newReduction
        .setIn(['appState', 'pages', pageIndexFunds], newData)
        .setIn(['appState', 'other', 'graphFunds', 'period'], response.period);

    return getFundsCachedValue(addFundLines(
        getXRange(newReduction, history.get('startTime')),
        newData, newFunds, history, pageIndexFunds, newFundLines
    ), pageIndexFunds, history);
};

export const rChangeFundsGraphPeriod = (reduction, req) => {
    const period = req.period || reduction.getIn(['appState', 'other', 'graphFunds', 'period']);
    if (req.noCache || !reduction.getIn(['appState', 'other', 'fundHistoryCache']).has(period)) {
        const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);
        return reduction.set(
            'effects', reduction.get('effects').push(
                buildMessage(EF_FUNDS_PERIOD_REQUESTED, { apiKey, period })
            )
        );
    }
    const data = reduction.getIn(['appState', 'other', 'fundHistoryCache', period]);
    return rHandleFundPeriodResponse(reduction, { period, data }, true);
};

