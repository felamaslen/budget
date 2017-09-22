/**
 * Carries out actions for the stocks list
 */

import { List as list, Map as map } from 'immutable';
import buildMessage from '../messageBuilder';
import {
    EF_STOCKS_LIST_REQUESTED, EF_STOCKS_PRICES_REQUESTED
} from '../constants/effects';
import { STOCK_INDICES, STOCKS_GRAPH_RESOLUTION } from '../misc/config';

export function rLoadStocksPrices(reduction) {
    const symbols = reduction.getIn(['other', 'stocksList', 'stocks'])
        .reduce((codes, item, code) => codes.push(code), list.of())
        .concat(
            reduction.getIn(['other', 'stocksList', 'indices'])
                .reduce((codes, item) => codes.push(item.get('code')), list.of())
        )
        .toJS();

    const apiKey = reduction.getIn(['other', 'stocksList', 'apiKey']);

    const req = { symbols, apiKey };

    return reduction.set('effects', reduction.get('effects').push(buildMessage(
        EF_STOCKS_PRICES_REQUESTED, req
    )));
}

export function rLoadStocksList(reduction) {
    return reduction.set('effects', reduction.get('effects').push(buildMessage(
        EF_STOCKS_LIST_REQUESTED, reduction.getIn(['user', 'apiKey'])
    )));
}
export function rHandleStocksListResponse(reduction, response) {
    const indices = map(STOCK_INDICES).map((item, code) => {
        return map({
            code,
            name: item,
            gain: 0,
            up: false,
            down: false
        });
    });

    const stocks = map(response.stocks.map(item => {
        return [item[0], map({
            code: item[0],
            name: item[1],
            weight: item[2] / response.total,
            gain: 0,
            up: false,
            down: false
        })];
    }));

    return rLoadStocksPrices(reduction
        .setIn(['other', 'stocksList', 'indices'], indices)
        .setIn(['other', 'stocksList', 'stocks'], stocks)
        .setIn(['other', 'stocksList', 'apiKey'], response.apiKey)
    );
}

function updateStock(item, row, loadedInitial) {
    const latest = Object.values(row['Time Series (Daily)'])[0];
    const open = latest['1. open'];
    const close = latest['4. close'];

    let newGain = parseFloat(100 * (close - open) / open, 10);
    if (isNaN(newGain)) {
        newGain = 0;
    }
    const up = loadedInitial && newGain > item.get('gain');
    const down = loadedInitial && newGain < item.get('gain');

    return item
        .set('gain', newGain)
        .set('up', up)
        .set('down', down);
}

export function limitTimeSeriesLength(timeSeries, limit) {
    return new Array(timeSeries.size)
        .fill(0)
        .reduce(itemList => {
            if (itemList.size <= limit) {
                return itemList;
            }

            const closestKey = itemList
                .slice(1)
                .reduce((last, item, key) => {
                    const thisInterval = item.get(0) - itemList.getIn([key, 0]);
                    if (thisInterval < last.interval) {
                        last.key = key;
                        last.interval = thisInterval;
                    }

                    return last;
                }, { key: 1, interval: Infinity })
                .key;

            return itemList.splice(closestKey, 1);

        }, timeSeries);
}

export function rHandleStocksPricesResponse(reduction, response) {
    let indices = reduction.getIn(['other', 'stocksList', 'indices'])
        .map(item => item.set('up', false).set('down', false));

    let stocks = reduction.getIn(['other', 'stocksList', 'stocks'])
        .map(item => item.set('up', false).set('down', false));

    const time = Math.floor(new Date().getTime() / 1000);

    let newReduction = reduction
        .setIn(['other', 'stocksList', 'loadedInitial'], true)
        .setIn(['other', 'stocksList', 'lastPriceUpdate'], time);

    if (!response) {
        return newReduction;
    }

    const loadedInitial = reduction.getIn(['other', 'stocksList', 'loadedInitial']);

    try {
        response.forEach(row => {
            const code = row['Meta Data']['2. Symbol'];

            if (indices.has(code)) {
                indices = indices.set(code, updateStock(indices.get(code), row, loadedInitial));
            }
            else if (stocks.has(code)) {
                stocks = stocks.set(code, updateStock(stocks.get(code), row, loadedInitial));
            }
        });

        newReduction = newReduction
            .setIn(['other', 'stocksList', 'indices'], indices)
            .setIn(['other', 'stocksList', 'stocks'], stocks);
    }
    catch (err) {
        // don't do anything
    }

    const weightedGain = stocks.reduce((last, item) => {
        return item.get('gain') * item.get('weight') + last;
    }, 0);

    // update stocks list graph
    const history = limitTimeSeriesLength(newReduction.getIn(
        ['other', 'stocksList', 'history']
    ), STOCKS_GRAPH_RESOLUTION);

    return newReduction
        .setIn(['other', 'stocksList', 'weightedGain'], weightedGain)
        .setIn(
            ['other', 'stocksList', 'oldWeightedGain'],
            reduction.getIn(['other', 'stocksList', 'weightedGain'])
        )
        .setIn(
            ['other', 'stocksList', 'history'],
            history.push(list([time, weightedGain]))
        );
}

