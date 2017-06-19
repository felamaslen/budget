/**
 * Process list data
 */

import { List as list, Map as map } from 'immutable';
import { YMD } from '../../misc/date';
import { LIST_COLS_SHORT, LIST_COLS_PAGES } from '../../misc/const';
import { TransactionsList } from '../../misc/data';

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

export const processPageDataFunds = (raw, pageIndex) => {
  const pageData = processPageDataList(raw, pageIndex);
  const history = raw.history;

  const transactionsKey = LIST_COLS_PAGES[pageIndex].indexOf('transactions');
  const itemKey = LIST_COLS_PAGES[pageIndex].indexOf('item');
  const rows = pageData.get('rows').map(row => {
    const transactionsJson = row.getIn(['cols', transactionsKey]);
    const transactions = new TransactionsList(transactionsJson);

    // add history to each fund item row
    let rowHistory = [];
    const historyKey = history.funds.items.indexOf(row.getIn(['cols', itemKey]));
    if (historyKey > -1) {
      const historyWithFund = history.history.filter(item => {
        return item[1].length > historyKey && item[1][historyKey] > 0;
      });
      if (historyWithFund.length > 0) {
        const firstPrice = historyWithFund[0][1][historyKey];
        rowHistory = list(historyWithFund.map(item => {
          return list([item[0], 100 * (item[1][historyKey] - firstPrice) / firstPrice]);
        }));
      }
    }

    return row.setIn(['cols', transactionsKey], transactions)
    .set('history', rowHistory)
    .set('historyPopout', false);
  });

  return pageData.set('rows', rows);
};

