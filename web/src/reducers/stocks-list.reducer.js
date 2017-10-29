/**
 * Carries out actions for the stocks list
 */

import { List as list, Map as map } from 'immutable';
import { STOCK_INDICES, STOCKS_GRAPH_RESOLUTION } from '../misc/config';

export function rHandleStocksListResponse(reduction, response) {
    if (!response) {
        return reduction;
    }

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
            price: 0,
            up: false,
            down: false
        })];
    }));

    return reduction
        .setIn(['other', 'stocksList', 'loadedList'], true)
        .setIn(['other', 'stocksList', 'indices'], indices)
        .setIn(['other', 'stocksList', 'stocks'], stocks)
        .setIn(['other', 'stocksList', 'lastPriceUpdate'], -1);
}

function updateStock(item, { open, close }, loadedInitial) {
    const changePct = 100 * (close - open) / open;
    const up = loadedInitial && changePct > item.get('gain');
    const down = loadedInitial && changePct < item.get('gain');

    return item
        .set('gain', changePct)
        .set('up', up)
        .set('down', down)
        .set('price', close);
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

export function rHandleStocksPricesResponse(reduction, res) {
    const time = Date.now();

    let newReduction = reduction
        .setIn(['other', 'stocksList', 'loadedInitial'], true)
        .setIn(['other', 'stocksList', 'lastPriceUpdate'], time);

    if (!res) {
        return newReduction;
    }

    let indices = reduction
        .getIn(['other', 'stocksList', 'indices'])
        .map(item => item.set('up', false).set('down', false));

    let stocks = reduction
        .getIn(['other', 'stocksList', 'stocks'])
        .map(item => item.set('up', false).set('down', false));

    const loadedInitial = reduction.getIn(['other', 'stocksList', 'loadedInitial']);

    try {
        res.forEach(row => {
            const code = row.code;

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
            history.push(list([time / 1000, weightedGain]))
        );
}

