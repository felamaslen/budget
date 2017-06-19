/**
 * Process list data
 */

import { List as list, Map as map } from 'immutable';
import { YMD } from '../../misc/date';
import { LIST_COLS_SHORT, LIST_COLS_PAGES } from '../../misc/const';
import { COLOR_FUND_UP, COLOR_FUND_DOWN } from '../../misc/config';
import { rgb2hex } from '../../misc/color';
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

const getFundColor = (value, min, max) => {
  const color = value > 0 ? COLOR_FUND_UP : COLOR_FUND_DOWN;
  const range = value > 0 ? max : min;
  if (value === 0 || Math.abs(range) === 0) {
    return [255, 255, 255];
  }
  return color.map(channel => Math.round(255 + (value / range) * (channel - 255)));
};

/**
 * Compare gains and add colour scales
 * @param {list} rows: item rows
 * @returns {list} modified rows
 */
export const getGainComparisons = rows => {
  const gains = rows.map(row => row.get('gain').pct);
  const min = gains.min();
  const max = gains.max();
  return rows.map(row => {
    const gain = row.get('gain');
    gain.color = rgb2hex(getFundColor(gain.pct, min, max));
    return row.set('gain', gain);
  });
};

/**
 * Add price history and profits / losses to fund items
 * @param {integer} pageIndex: index of page
 * @param {map} row: item row
 * @param {array} history: raw history response froms API
 * @param {TransactionsList} transactions: item transactions list
 * @returns {map} modified row
*/
export const addPriceHistory = (pageIndex, row, history, transactions) => {
  const itemKey = LIST_COLS_PAGES[pageIndex].indexOf('item');
  // add history to each fund item row
  let gainHistory = list([]);

  // for overall and daily profits / losses
  let value = 0;
  let pct = 0;
  let abs = 0;
  let dayPct = 0;
  let dayAbs = 0;
  const color = 'white';

  const historyKey = history.funds.items.indexOf(row.getIn(['cols', itemKey]));
  if (historyKey > -1) {
    const priceHistory = list(history.history.filter(item => {
      return item[1].length > historyKey && item[1][historyKey] > 0;
    })).map(item => list([item[0], list(item[1])]));

    if (priceHistory.size > 0) {
      const firstPrice = priceHistory.getIn([0, 1, historyKey]);
      const lastPrice = priceHistory.getIn([-1, 1, historyKey]);
      const nextPrice = priceHistory.getIn([-2, 1, historyKey]);

      gainHistory = priceHistory.map(item => {
        return item.set(1, 100 * (item.getIn([1, historyKey]) - firstPrice) / firstPrice);
      });

      const units = transactions.getLastUnits();
      const cost = transactions.getLastCost();
      value = lastPrice * units;
      pct = 100 * (value - cost) / cost;
      abs = value - cost;
      dayPct = 100 * (lastPrice - nextPrice) / nextPrice;
      dayAbs = (lastPrice - nextPrice) * units;
    }
  }
  const gain = { value, pct, abs, dayPct, dayAbs, color };
  return row.set('history', gainHistory).set('gain', gain);
};

export const processPageDataFunds = (raw, pageIndex) => {
  const pageData = processPageDataList(raw, pageIndex);

  const transactionsKey = LIST_COLS_PAGES[pageIndex].indexOf('transactions');
  const rows = getGainComparisons(pageData.get('rows').map(row => {
    const transactionsJson = row.getIn(['cols', transactionsKey]);
    const transactions = new TransactionsList(transactionsJson);

    return addPriceHistory(pageIndex, row, raw.history, transactions)
    .setIn(['cols', transactionsKey], transactions)
    .set('historyPopout', false);
  }));

  return pageData.set('rows', rows).set('history', raw.history);
};

