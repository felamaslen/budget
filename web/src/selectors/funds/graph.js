import { createSelector } from 'reselect';
import {
    GRAPH_FUNDS_MODE_PRICE,
    GRAPH_FUNDS_MODE_ROI,
    GRAPH_FUNDS_OVERALL_ID
} from '~client/constants/graph';
import { COLOR_GRAPH_FUND_LINE } from '~client/constants/colors';
import { rgba, colorKey } from '~client/modules/color';
import { separateLines } from '~client/modules/funds';
import { getTotalUnits, getTotalCost, isSold } from '~client/modules/data';
import {
    getViewSoldFunds,
    transactionsKey,
    itemKey,
    getRowLengths,
    getCurrentFundsCache,
    getFundsRows
} from '~client/selectors/funds/helpers';
import { getFundLineProcessed } from './lines';

const getGraphMode = state => state.other.graphFunds.mode;
const getEnabledList = state => state.other.graphFunds.enabledList;

function getFundItems(rows, enabledList, soldList) {
    const colors = rows.reduce((last, { id, cols }) => ({
        ...last,
        [id]: colorKey(cols[itemKey])
    }), { [GRAPH_FUNDS_OVERALL_ID]: COLOR_GRAPH_FUND_LINE });

    return enabledList.filter(({ id }) =>
        !soldList[id] &&
        (id === GRAPH_FUNDS_OVERALL_ID || rows.some(({ id: rowId }) => rowId === id))
    )
        .map(({ id, enabled }) => ({
            id,
            color: colors[id],
            item: id === GRAPH_FUNDS_OVERALL_ID
                ? 'Overall'
                : rows.find(({ id: rowId }) => rowId === id).cols[itemKey],
            enabled
        }));
}

function getFundLines(times, timeOffsets, priceUnitsCosts, mode, enabledList) {
    return enabledList.reduce((last, { id, enabled }) => {
        if (priceUnitsCosts.sold[id] || !(enabled && times[id] && times[id].length > 1)) {
            return last;
        }

        const item = getFundLineProcessed(times[id], timeOffsets, priceUnitsCosts, mode, id);
        if (!item) {
            return last;
        }

        return last.concat([{
            ...item,
            line: separateLines(item.line)
        }]);
    }, []);
}

function getPriceUnitsCosts(rows, rawPrices, startTime, cacheTimes, viewSold) {
    const rowsWithInfo = rows
        .filter(({ id }) => rawPrices[id])
        .map(({ id, cols }) => ({
            id,
            transactions: cols[transactionsKey],
            transactionsToDate: rawPrices[id].values.map((price, index) =>
                cols[transactionsKey].filter(({ date }) =>
                    date < 1000 * (startTime + cacheTimes[index + rawPrices[id].startIndex])
                )
            )
        }));

    const sold = rowsWithInfo.reduce((last, { id, transactions }) => ({
        ...last,
        [id]: !viewSold && isSold(transactions)
    }), {});

    const prices = rowsWithInfo.reduce((last, { id }) => ({
        ...last,
        [id]: rawPrices[id].values
    }), {});

    const units = rowsWithInfo.reduce((last, { id, transactionsToDate }) => ({
        ...last,
        [id]: prices[id].map((price, index) => getTotalUnits(transactionsToDate[index]))
    }), {});

    const costs = rowsWithInfo.reduce((last, { id, transactionsToDate }) => ({
        ...last,
        [id]: prices[id].map((price, index) => getTotalCost(transactionsToDate[index]))
    }), {});

    return { sold, prices, units, costs };
}

const getFormattedHistory = createSelector([
    getViewSoldFunds,
    getFundsRows,
    getCurrentFundsCache,
    getGraphMode,
    getEnabledList
], (viewSoldFunds, rows, cache, mode, enabledList) => {
    // get a formatted list of lines for display in the fund price / value graph

    if (!cache) {
        return { fundItems: [] };
    }

    const { prices, startTime, cacheTimes } = cache;

    const priceUnitsCosts = getPriceUnitsCosts(rows, prices, startTime, cacheTimes, viewSoldFunds);

    const { timeOffsets, rowLengths, maxLength } = getRowLengths(prices);

    const times = Object.keys(prices).reduce((items, id) => ({
        ...items,
        [id]: cacheTimes.slice(timeOffsets[id], timeOffsets[id] + rowLengths[id])
    }), { [GRAPH_FUNDS_OVERALL_ID]: cacheTimes.slice(0, maxLength) });

    const fundItems = getFundItems(rows, enabledList, priceUnitsCosts.sold);

    const fundLines = getFundLines(times, timeOffsets, priceUnitsCosts, mode, enabledList);

    return { startTime, cacheTimes, fundItems, fundLines };
});

function getLines({ isMobile, fundLines, fundItems, mode }) {
    return (fundLines || []).reduce((lines, { id, line }) => {
        const mainLine = id === GRAPH_FUNDS_OVERALL_ID;
        if (isMobile && !mainLine && mode !== GRAPH_FUNDS_MODE_PRICE) {
            return lines;
        }

        const color = rgba(fundItems.find(({ id: itemId }) => itemId === id).color);

        const strokeWidth = 1 + 0.5 * (mainLine >> 0);

        const itemLines = line.map((data, key) => ({
            key: `${id}-${key}`,
            data,
            smooth: mode === GRAPH_FUNDS_MODE_ROI,
            color,
            strokeWidth
        }));

        return lines.concat(itemLines);
    }, []);
}

function getGraphProps(mode, { startTime, cacheTimes, fundItems, fundLines }, isMobile) {
    const lines = getLines({ isMobile, fundLines, fundItems, mode });

    return { fundItems, fundLines, lines, startTime, cacheTimes };
}

const getMobileProp = (state, { isMobile }) => isMobile;

export const makeGetGraphProps = () => createSelector([
    getGraphMode, getFormattedHistory, getMobileProp
], getGraphProps);
