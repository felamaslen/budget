/**
 * Carries out actions for the stocks list
 */

import { List as list, Map as map } from 'immutable';
import buildMessage from '../messageBuilder';
import {
  EF_STOCKS_LIST_REQUESTED, EF_STOCKS_PRICES_REQUESTED
} from '../constants/effects';
import { STOCK_INDICES, STOCKS_GRAPH_RESOLUTION } from '../misc/config';

export const rLoadStocksPrices = reduction => {
  const symbols = reduction.getIn(['appState', 'other', 'stocksList', 'stocks'])
  .map(item => item.get('code'))
  .concat(
    reduction.getIn(['appState', 'other', 'stocksList', 'indices'])
    .map(item => item.get('code'))
  ).join(',');

  return reduction.set('effects', reduction.get('effects').push(buildMessage(
    EF_STOCKS_PRICES_REQUESTED, symbols
  )));
};

export const rLoadStocksList = reduction => {
  return reduction.set('effects', reduction.get('effects').push(buildMessage(
    EF_STOCKS_LIST_REQUESTED, reduction.getIn(['appState', 'user', 'apiKey'])
  )));
};
export const rHandleStocksListResponse = (reduction, response) => {
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
  .setIn(['appState', 'other', 'stocksList', 'indices'], indices)
  .setIn(['appState', 'other', 'stocksList', 'stocks'], stocks));
};

const updateStock = (item, row, loadedInitial) => {
  let newGain = parseFloat(row.cp);
  if (isNaN(newGain)) {
    newGain = 0;
  }
  const up = loadedInitial && newGain > item.get('gain');
  const down = loadedInitial && newGain < item.get('gain');
  return item.set('gain', newGain).set('up', up).set('down', down);
};
export const rHandleStocksPricesResponse = (reduction, response) => {
  let indices = reduction.getIn(['appState', 'other', 'stocksList', 'indices'])
  .map(item => item.set('up', false).set('down', false));

  let stocks = reduction.getIn(['appState', 'other', 'stocksList', 'stocks'])
  .map(item => item.set('up', false).set('down', false));

  const time = Math.floor(new Date().getTime() / 1000);

  let newReduction = reduction
  .setIn(['appState', 'other', 'stocksList', 'loadedInitial'], true)
  .setIn(['appState', 'other', 'stocksList', 'lastPriceUpdate'], time);

  const loadedInitial = reduction.getIn(['appState', 'other', 'stocksList', 'loadedInitial']);

  try {
    response.forEach(row => {
      const code = `${row.e}:${row.t}`;
      if (indices.has(code)) {
        indices = indices.set(code, updateStock(indices.get(code), row, loadedInitial));
      }
      else if (stocks.has(code)) {
        stocks = stocks.set(code, updateStock(stocks.get(code), row, loadedInitial));
      }
    });

    newReduction = newReduction
    .setIn(['appState', 'other', 'stocksList', 'indices'], indices)
    .setIn(['appState', 'other', 'stocksList', 'stocks'], stocks);
  }
  finally {
    const weightedGain = stocks.reduce((last, item) => {
      return item.get('gain') * item.get('weight') + last;
    }, 0);

    // update stocks list graph
    let history = newReduction.getIn(['appState', 'other', 'stocksList', 'history']);
    while (history.size > STOCKS_GRAPH_RESOLUTION) {
      const closestKey = history.slice(1).reduce((last, item, key) => {
        const interval = item.get(0) - history.getIn([key, 0]);
        if (interval < last[1]) {
          return [key, interval];
        }
        return last;
      }, [1, Infinity])[0] + 1;

      history = history.splice(closestKey, 1);
    }

    return newReduction
    .setIn(['appState', 'other', 'stocksList', 'weightedGain'], weightedGain)
    .setIn(
      ['appState', 'other', 'stocksList', 'oldWeightedGain'],
      reduction.getIn(['appState', 'other', 'stocksList', 'weightedGain'])
    )
    .setIn(
      ['appState', 'other', 'stocksList', 'history'],
      history.push(list([time, weightedGain]))
    );
  }
};

