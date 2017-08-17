/**
 * Process funds data
 */

import { List as list, Map as map } from 'immutable';
import {
    COLOR_GRAPH_FUND_LINE, COLOR_FUND_UP, COLOR_FUND_DOWN
} from '../../misc/config';
import {
    LIST_COLS_PAGES,
    GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_MODE_ABSOLUTE, GRAPH_FUNDS_MODE_PRICE
} from '../../misc/const';
import { colorKey } from '../../misc/color';
import { formatAge } from '../../misc/format';
import { notNull, TransactionsList } from '../../misc/data';

const getFundColor = (value, min, max) => {
    const color = value > 0 ? COLOR_FUND_UP : COLOR_FUND_DOWN;
    const range = value > 0 ? max : min;
    if (value === 0 || Math.abs(range) === 0) {
        return [255, 255, 255];
    }
    return color.map(channel => Math.round(255 + (value / range) * (channel - 255)));
};

export const getFundsCachedValueAgeText = history => {
    if (!history || !history.get('history').size === 0) {
        return null;
    }
    const valueTime = history.get('startTime') + history.get('history').last().get(0);
    return formatAge(new Date().getTime() / 1000 - valueTime);
};
export const getFundsCachedValue = (reduction, pageIndex, history) => {
    if (!history || !history.get('history').size) {
        return reduction;
    }
    const ageText = getFundsCachedValueAgeText(history);

    const value = history.get('history').last().get(1).map((price, key) => {
        const transactions = history.getIn(['funds', 'transactions', key]);
        const transactionsList = new TransactionsList(transactions, false, true);
        const units = transactionsList.getTotalUnits();
        return units * price;
    }).reduce((a, b) => a + b, 0);

    return reduction.setIn(['appState', 'other', 'fundsCachedValue'], map({ ageText, value }));
};

/**
 * Compare gains and add colour scales
 * @param {list} rows: item rows
 * @returns {list} modified rows
 */
export const getGainComparisons = rows => {
    const gains = rows.map(row => row.get('gain').gain);
    const min = gains.min();
    const max = gains.max();
    return rows.map(row => {
        const gain = row.get('gain');
        gain.color = getFundColor(gain.gain, min, max);
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
    let gainHistory = list.of();

    // for overall and daily profits / losses
    let value = 0;
    let gain = 0;
    let abs = 0;
    let dayGain = 0;
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
            gain = (value - cost) / cost;
            abs = value - cost;
            dayGain = (lastPrice - nextPrice) / nextPrice;
            dayAbs = (lastPrice - nextPrice) * units;
        }
    }
    const rowGain = { value, gain, abs, dayGain, dayAbs, color };
    return row.set('history', gainHistory).set('gain', rowGain);
};

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
    const lines = fundLines.slice(1).map((line, index) => {
        if (line.get('enabled')) {
            return list([line.get('color'), getLine(index)]);
        }
        return null;
    }).filter(notNull);

    if (fundLines.getIn([0, 'enabled']) && !!getMain) {
        return lines.push(getMain());
    }
    return lines;
};

export const zoomFundLines = (linesAll, reduction) => {
    // restrict fund lines by zooming
    const zoom = reduction.getIn(['appState', 'other', 'graphFunds', 'zoom']);
    const minX = zoom.get(0);
    const maxX = zoom.get(1);
    const lines = linesAll.map(line => {
        const points = line.get(1);
        return line.set(1, points.filter((point, pointKey) => {
            const thisVisible = point.get(0) >= minX && point.get(0) <= maxX;
            if (thisVisible) {
                return true;
            }
            if (pointKey < points.size) {
                const next = points.getIn([pointKey + 1, 0]);
                if (next >= minX && next <= maxX) {
                    return true;
                }
            }
            if (pointKey > 0) {
                const prev = points.getIn([pointKey - 1, 0]);
                if (prev >= minX && prev <= maxX) {
                    return true;
                }
            }
            return false;
        }));
    });
    return lines;
};

export const addFundLines = (reduction, data, funds, history, pageIndex, fundLines) => {
    const mode = reduction.getIn(['appState', 'other', 'graphFunds', 'mode']);

    let linesAll;
    switch (mode) {
    case GRAPH_FUNDS_MODE_PRICE:
        linesAll = getLines(
            fundLines,
            index => getLinesPrice(data, funds, history, index, true)
        );
        break;
    case GRAPH_FUNDS_MODE_ABSOLUTE:
        linesAll = getLines(
            fundLines,
            index => getLinesAbsolute(data, funds, history, index),
            () => getMainAbsolute(data, funds, history)
        );
        break;
    case GRAPH_FUNDS_MODE_ROI:
    default:
        linesAll = getLines(
            fundLines,
            index => getLinesROI(data, funds, history, index),
            () => getMainROI(data, funds, history)
        );
    }

    const lines = zoomFundLines(linesAll, reduction);

    return reduction.setIn(
        ['appState', 'pages', pageIndex],
        reduction.getIn(['appState', 'pages', pageIndex])
            .set('linesAll', linesAll)
            .set('lines', lines)
            .set('fundLines', fundLines)
    );
};

export const getFundsWithTransactions = (history, rows, pageIndex) => {
    const itemKey = LIST_COLS_PAGES[pageIndex].indexOf('item');
    const transactionsKey = LIST_COLS_PAGES[pageIndex].indexOf('transactions');

    return history.getIn(['funds', 'items']).map(item => {
        const transactions = rows
            .find(row => row.getIn(['cols', itemKey]) === item)
            .getIn(['cols', transactionsKey]);

        return transactions ? { item, transactions } : null;
    }).filter(fund => fund !== null);
};
export const getFundLines = (funds, fundsEnabled, overallEnabled, replace) => {
    return funds.map((fund, fundKey) => {
        const enabled = fundsEnabled.get(fundKey);
        const item = fund.item;
        const color = colorKey(fundKey + 1);
        const fundLine = map({ enabled, item, color });
        return replace ? replace(fund, fundLine) : fundLine;
    }).unshift(map({
        enabled: overallEnabled,
        item: 'Overall',
        color: COLOR_GRAPH_FUND_LINE
    }));
};

export const getFormattedHistory = (reduction, pageIndex, history) => {
    // format the data according to the mode
    const lastHistoryItem = history.get('history').last();
    if (!lastHistoryItem) {
        return reduction;
    }

    const data = reduction.getIn(['appState', 'pages', pageIndex]);
    const rows = data.get('rows');

    // associate funds with transactions
    const funds = getFundsWithTransactions(history, rows, pageIndex);
    const fundsEnabled = lastHistoryItem.get(1).map(item => item > 0);
    const fundLines = getFundLines(funds, fundsEnabled, true);

    return addFundLines(reduction.setIn(
        ['appState', 'pages', pageIndex],
        data
            .set('history', history)
            .set('funds', funds)
    ), data, funds, history, pageIndex, fundLines);
};

export const getXRange = (reduction, startTime) => {
    const minX = 0;
    const maxX = Math.floor(new Date().getTime() / 1000 - startTime);
    return reduction
        .setIn(['appState', 'other', 'graphFunds', 'zoom'], list([minX, maxX]))
        .setIn(['appState', 'other', 'graphFunds', 'range'], list([minX, maxX]));
};

