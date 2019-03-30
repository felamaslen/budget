import { List as list, Map as map, OrderedMap } from 'immutable';
import { createSelector } from 'reselect';
import {
    GRAPH_FUNDS_MODE_PRICE,
    GRAPH_FUNDS_MODE_ROI,
    GRAPH_FUNDS_OVERALL_ID
} from '~client/constants/graph';
import { COLOR_GRAPH_FUND_LINE } from '~client/constants/colors';
import { rgba, colorKey } from '~client/helpers/color';
import { separateLines } from '~client/helpers/funds';
import { getViewSoldFunds, transactionsKey, itemKey, getRowLengths, getCurrentFundsCache, getFundsRows } from './helpers';
import { getFundLineProcessed } from './lines';

const getGraphMode = state => state.getIn(['other', 'graphFunds', 'mode']);
const getEnabledList = state => state.getIn(['other', 'graphFunds', 'enabledList']);

function getFundItems(rows, enabledList, soldList) {
    const colors = rows.map(row => colorKey(row.getIn(['cols', itemKey])))
        .set(GRAPH_FUNDS_OVERALL_ID, COLOR_GRAPH_FUND_LINE);

    return enabledList.filter((item, id) => !soldList.get(id) &&
        (id === GRAPH_FUNDS_OVERALL_ID || rows.has(id))
    )
        .map((enabled, id) => {
            const color = colors.get(id);

            const item = id === GRAPH_FUNDS_OVERALL_ID
                ? 'Overall'
                : rows.getIn([id, 'cols', itemKey]);

            return map({ item, color, enabled });
        });
}

function getFundLines(times, timeOffsets, priceUnitsCosts, mode, enabledList) {
    return enabledList.reduce((last, enabled, id) => {
        if (priceUnitsCosts.sold.get(id) ||
            !(enabled && times.get(id) && times.get(id).size > 1)
        ) {

            return last;
        }

        const item = getFundLineProcessed(times.get(id), timeOffsets, priceUnitsCosts, mode, id);
        if (!item) {
            return last;
        }

        const line = item.set('line', separateLines(item.get('line')));

        return last.push(line);

    }, list.of());
}

function getPriceUnitsCosts(rows, prices, startTime, cacheTimes, viewSold) {
    return rows.reduce((red, row, id) => {
        if (!prices.get(id)) {
            return red;
        }

        const transactions = row.getIn(['cols', transactionsKey]);

        const thisPrices = prices.getIn([id, 'values']);
        const timeOffset = prices.getIn([id, 'startIndex']);

        const { thisUnits, thisCosts } = thisPrices.reduce((rowRed, price, index) => {
            const time = cacheTimes.get(index + timeOffset);

            const transactionsToNow = transactions.filter(item =>
                item.get('date') < 1000 * (startTime + time));

            const thisPriceUnits = transactionsToNow.getTotalUnits();
            const thisPriceCost = transactionsToNow.getTotalCost();

            return {
                thisUnits: rowRed.thisUnits.push(thisPriceUnits),
                thisCosts: rowRed.thisCosts.push(thisPriceCost)
            };
        }, {
            thisUnits: list.of(),
            thisCosts: list.of()
        });

        return {
            sold: red.sold.set(id, !viewSold && transactions.isSold()),
            prices: red.prices.set(id, thisPrices),
            units: red.units.set(id, thisUnits),
            costs: red.costs.set(id, thisCosts)
        };
    }, {
        sold: map.of(),
        prices: map.of(),
        units: map.of(),
        costs: map.of()
    });
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
        return {
            fundItems: OrderedMap.of()
        };
    }

    const prices = cache.get('prices');
    const startTime = cache.get('startTime');
    const cacheTimes = cache.get('cacheTimes');

    const priceUnitsCosts = getPriceUnitsCosts(rows, prices, startTime, cacheTimes, viewSoldFunds);

    const { timeOffsets, rowLengths, maxLength } = getRowLengths(prices);

    const times = rowLengths.reduce(
        (items, length, id) =>
            items.set(id, cacheTimes.slice(timeOffsets.get(id), timeOffsets.get(id) + length)),
        map({ [GRAPH_FUNDS_OVERALL_ID]: cacheTimes.slice(0, maxLength) })
    );

    const fundItems = getFundItems(rows, enabledList, priceUnitsCosts.sold);

    const fundLines = getFundLines(times, timeOffsets, priceUnitsCosts, mode, enabledList);

    return { startTime, cacheTimes, fundItems, fundLines };
});

function getLines({ isMobile, fundLines, fundItems, mode }) {
    if (!fundLines) {
        return list.of();
    }

    return fundLines.reduce((lines, item) => {
        const id = item.get('id');
        const mainLine = id === GRAPH_FUNDS_OVERALL_ID;
        if (isMobile && !mainLine && mode !== GRAPH_FUNDS_MODE_PRICE) {
            return lines;
        }

        const color = rgba(fundItems.getIn([id, 'color']));

        const strokeWidth = 1 + 0.5 * (mainLine >> 0);

        const itemLines = item.get('line').map((data, key) => map({
            key: `${id}-${key}`,
            data,
            smooth: mode === GRAPH_FUNDS_MODE_ROI,
            color,
            strokeWidth
        }));

        return lines.concat(itemLines);

    }, list.of());
}

function getGraphProps(mode, { startTime, cacheTimes, fundItems, fundLines }, isMobile) {
    const lines = getLines({ isMobile, fundLines, fundItems, mode });

    return { fundItems, fundLines, lines, startTime, cacheTimes };
}

const getMobileProp = (state, { isMobile }) => isMobile;

export const makeGetGraphProps = () => createSelector([
    getGraphMode, getFormattedHistory, getMobileProp
], getGraphProps);

