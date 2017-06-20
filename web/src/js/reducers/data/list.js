/**
 * Process list data
 */

import { fromJS, List as list, Map as map } from 'immutable';
import { YMD } from '../../misc/date';
import {
  LIST_COLS_SHORT, LIST_COLS_PAGES
} from '../../misc/const';
import { TransactionsList } from '../../misc/data';
import {
  getGainComparisons, addPriceHistory, getFormattedHistory, getXRange
} from './funds';

/**
 * process list page data response
 * @param {Record} reduction: app state
 * @param {integer} pageIndex: page index
 * @param {object} raw: api JSON data
 * @returns {Record} modified reduction
 */
export const processPageDataList = (reduction, pageIndex, raw) => {
  const numRows = raw.data.length;
  const numCols = LIST_COLS_PAGES[pageIndex].length;
  const total = raw.total;

  const data = map({
    numRows,
    numCols,
    total
  });

  const rows = list(raw.data.map(item => {
    return map({
      id: item.I,
      cols: list(LIST_COLS_SHORT[pageIndex].map(col => {
        if (col === 'd') {
          return new YMD(item[col]);
        }
        return item[col];
      }))
    });
  }));

  return reduction.setIn(['appState', 'pages', pageIndex], map({ data, rows }));
};

export const processPageDataFunds = (reduction, pageIndex, data) => {
  let newReduction = processPageDataList(reduction, pageIndex, data);
  const history = fromJS(data.history);

  const transactionsKey = LIST_COLS_PAGES[pageIndex].indexOf('transactions');
  const rows = getGainComparisons(newReduction.getIn(
    ['appState', 'pages', pageIndex, 'rows']
  ).map(row => {
    const transactionsJson = row.getIn(['cols', transactionsKey]);
    const transactions = new TransactionsList(transactionsJson);

    return addPriceHistory(pageIndex, row, history, transactions)
    .setIn(['cols', transactionsKey], transactions)
    .set('historyPopout', false);
  }));

  const period = reduction.getIn(['appState', 'other', 'graphFunds', 'period']);
  newReduction = newReduction
  .setIn(['appState', 'pages', pageIndex, 'rows'], rows)
  .setIn(['appState', 'other', 'fundHistoryCache', period], { data: { data: data.history } });

  return getFormattedHistory(
    getXRange(newReduction, data.history.startTime), pageIndex, history);
};

