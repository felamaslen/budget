/**
 * Process list data
 */

import { fromJS, List as list, Map as map } from 'immutable';
import { YMD } from '../../misc/date';
import {
  LIST_COLS_SHORT, LIST_COLS_PAGES
} from '../../misc/const';
import { TransactionsList } from '../../misc/data';
import { getGainComparisons, addPriceHistory, getFormattedHistory } from './funds';

export const processPageDataList = (raw, pageIndex) => {
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

  return map({ data, rows });
};

export const processPageDataFunds = (raw, pageIndex, graphFundsMode) => {
  const pageData = processPageDataList(raw, pageIndex);
  const history = fromJS(raw.history);

  const transactionsKey = LIST_COLS_PAGES[pageIndex].indexOf('transactions');
  const rows = getGainComparisons(pageData.get('rows').map(row => {
    const transactionsJson = row.getIn(['cols', transactionsKey]);
    const transactions = new TransactionsList(transactionsJson);

    return addPriceHistory(pageIndex, row, history, transactions)
    .setIn(['cols', transactionsKey], transactions)
    .set('historyPopout', false);
  }));

  return getFormattedHistory(pageData.set('rows', rows), history, graphFundsMode);
};

