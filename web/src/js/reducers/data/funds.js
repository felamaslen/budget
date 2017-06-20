/**
 * Process funds data
 */

import { List as list } from 'immutable';
import { colorKey, rgb2hex } from '../../misc/color';
import {
  COLOR_GRAPH_FUND_LINE, COLOR_FUND_UP, COLOR_FUND_DOWN
} from '../../misc/config';
import {
  LIST_COLS_PAGES,
  GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_MODE_ABSOLUTE, GRAPH_FUNDS_MODE_PRICE
} from '../../misc/const';
import { notNull } from '../../misc/data';

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

  const historyKey = history.getIn(['funds', 'items']).indexOf(row.getIn(['cols', itemKey]));
  if (historyKey > -1) {
    const priceHistory = history.get('history').filter(item => {
      return item.last().size > historyKey && item.getIn([1, historyKey]) > 0;
    });

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

/*
  getLinesPrice(index) {
    return this.raw.map(item => {
      if (!item[1][index]) {
        return null;
      }
      return [item[0], item[1][index]];
    }).filter(item => item !== null);
  }
*/

const getLinesCostValue = (index, funds, history, callback) => {
  return history.get('history').map(item => {
    const prices = item.last().map((price, fundKey) => {
      return index === -1 || index === fundKey ? price : null;
    });

    // filter the fund's transactions to those which were before this point in time
    const currentTransactions = prices.map((price, fundKey) => {
      return price ? funds.get(fundKey).transactions.filter(transaction => {
        return transaction.get('date').timestamp() <= item.first() + history.get('startTime');
      }) : null;
    });

    const currentCost = currentTransactions.map(
      transactions => transactions ? transactions.getTotalCost() : 0
    ).reduce((a, b) => a + b, 0);

    const currentUnits = currentTransactions.map(
      transactions => transactions ? transactions.getTotalUnits() : 0
    );

    const currentValue = prices.map((price, fundKey) => {
      return price ? price * currentUnits.get(fundKey) : 0;
    }).reduce((a, b) => a + b, 0);

    return callback(item, currentCost, currentValue);
  }).filter(notNull);
};

const getLinesROI = (data, funds, history, index) => {
  return getLinesCostValue(index, funds, history, (item, cost, value) => {
    return cost > 0 ? item.set(1, 100 * (value - cost) / cost) : null;
  }).filter(notNull);
};
const getLinesAbsolute = (data, funds, history, index) => {
  return getLinesCostValue(index, funds, history, (item, cost, value) => {
    return value > 0 ? item.set(1, value) : null;
  });
};
const getLinesPrice = (data, funds, history, index) => {
  return history.get('history').map(item => {
    if (!item.getIn([1, index])) {
      return null;
    }
    return item.set(1, item.getIn([1, index]));
  }).filter(notNull);
};
const getMainROI = (data, funds, history) => {
  const line = getLinesROI(data, funds, history, -1);
  return list([COLOR_GRAPH_FUND_LINE, line]);
};
const getMainAbsolute = (data, funds, history) => {
  const line = getLinesAbsolute(data, funds, history, -1);
  return list([COLOR_GRAPH_FUND_LINE, line]);
};

/**
 * Get formatted data line(s) for the funds graph
 * @param {list} fundLines: list of enabled fund lines
 * @param {function} getLine: callback to get individual lines
 * @param {function} getMain: callback to get main line ("overall")
 * @returns {list} list of lines
 */
const getLines = (fundLines, getLine, getMain) => {
  const lines = fundLines.slice(1).map((status, index) => {
    if (status) {
      const color = colorKey(index + 1);
      return list([color, getLine(index)]);
    }
    return null;
  }).filter(notNull);

  if (fundLines.first() && !!getMain) {
    return lines.push(getMain());
  }
  return lines;
};

export const zoomFundLines = (lines, reduction) => {
  // restrict fund lines by zooming
  return lines;
  /*
  let newLines;

  const mode = reduction.getIn(['appState', 'other', 'graphFunds', 'mode']),
  const zoom = reduction.getIn(['appState', 'other', 'graphFunds', 'zoom'])
  const hlPoint = reduction.getIn(['appState', 'other', 'graphFunds', 'hlPoints']);

  if (zoom.first() !== null && zoom.last() !== null) {
  newLines = lines.map(line => {
    const points = line.last();
    return line.set(1, points.filter((point, pointKey) => {
    }));
  });

  itemInRange(points, key) {
    const nextVisible = points.getIn([Math.min(points.size - 1, key + 1), 0]) >= this.minX;
    const prevVisible = points.getIn([Math.max(0, key - 1), 0]) <= this.maxX;

    return nextVisible && prevVisible;
  }
  filterDataVisible() {
    return this.props.lines.map(line => {
      const points = line.get(1);
      return line.set(1, points.filter((point, pointKey) => {
        return this.itemInRange(points, pointKey);
      }));
    });
  }

  return newLines;
  */
};

export const getFormattedHistory = (reduction, pageIndex, history) => {
  // format the data according to the mode
  const lastHistoryItem = history.get('history').last();
  const itemKey = LIST_COLS_PAGES[pageIndex].indexOf('item');
  const transactionsKey = LIST_COLS_PAGES[pageIndex].indexOf('transactions');

  const data = reduction.getIn(['appState', 'pages', pageIndex]);
  const rows = data.get('rows');

  // associate funds with transactions
  const funds = history.getIn(['funds', 'items']).map(item => {
    const transactions = rows
    .find(row => row.getIn(['cols', itemKey]) === item)
    .getIn(['cols', transactionsKey]);

    return transactions ? { item, transactions } : null;
  }).filter(fund => fund !== null);

  const fundLines = funds.map((fund, fundKey) => {
    return lastHistoryItem && lastHistoryItem.getIn([1, fundKey]) > 0;
  }).unshift(true); // overall line (TODO: toggle this)

  const mode = reduction.getIn(['appState', 'other', 'graphFunds', 'mode']);

  let lines;
  switch (mode) {
  case GRAPH_FUNDS_MODE_PRICE:
    lines = getLines(
      fundLines,
      index => getLinesPrice(data, funds, history, index, true)
    );
    break;
  case GRAPH_FUNDS_MODE_ABSOLUTE:
    lines = getLines(
      fundLines,
      index => getLinesAbsolute(data, funds, history, index),
      () => getMainAbsolute(data, funds, history)
    );
    break;
  case GRAPH_FUNDS_MODE_ROI:
  default:
    lines = getLines(
      fundLines,
      index => getLinesROI(data, funds, history, index),
      () => getMainROI(data, funds, history)
    );
  }

  lines = zoomFundLines(lines, reduction);

  return reduction.setIn(
    ['appState', 'pages', pageIndex],
    data.set('lines', lines).set('history', history)
  );
};

