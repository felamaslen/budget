/**
 * Process list data
 */

import { fromJS, List as list, Map as map } from 'immutable';
import {
  LIST_COLS_SHORT, LIST_COLS_PAGES, BLOCK_PAGES, PAGES
} from '../../misc/const';
import { YMD } from '../../misc/date';
import { TransactionsList } from '../../misc/data';
import {
  getGainComparisons, addPriceHistory, getFormattedHistory, getXRange,
  getFundsCachedValue
} from './funds';
import buildMessage from '../../messageBuilder';
import { EF_BLOCKS_REQUESTED } from '../../constants/effects';

export const loadBlocks = (reduction, pageIndex, noClear) => {
  if (BLOCK_PAGES.indexOf(pageIndex) === -1) {
    return reduction
    .setIn(['appState', 'other', 'blockView', 'blocks'], null);
  }
  let newReduction = reduction;
  if (!noClear) {
    newReduction = newReduction.setIn(['appState', 'other', 'blockView', 'blocks'], null);
  }
  const apiKey = reduction.getIn(['appState', 'user', 'apiKey']);
  const table = PAGES[pageIndex];
  const loadKey = new Date().getTime();

  return newReduction.set('effects', reduction.get('effects').push(
    buildMessage(EF_BLOCKS_REQUESTED, { apiKey, table, loadKey })
  )).setIn(['appState', 'other', 'blockView', 'loadKey'], loadKey);
};

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

  return loadBlocks(
    reduction.setIn(
      ['appState', 'pages', pageIndex], map({ data, rows })
    ), pageIndex
  );
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
  newReduction = getFundsCachedValue(
    newReduction
    .setIn(['appState', 'pages', pageIndex, 'rows'], rows)
    .setIn(['appState', 'other', 'fundHistoryCache', period], { data: { data: data.history } }),
    pageIndex, history
  );

  return getFormattedHistory(
    getXRange(newReduction, data.history.startTime), pageIndex, history);
};

