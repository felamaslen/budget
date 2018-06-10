import { List as list, Map as map } from 'immutable';
import { createSelector } from 'reselect';
import { GRAPH_FUNDS_MODE_PRICE, GRAPH_FUNDS_MODE_ROI } from '../../constants/graph';
import { COLOR_GRAPH_FUND_LINE } from '../../constants/colors';
import { rgba, colorKey } from '../../helpers/color';
import { separateLines } from '../../helpers/funds';
import { transactionsKey, itemKey, getRowLengths, getCurrentFundsCache, getFundsRows } from './helpers';
import { getFundLineProcessed } from './lines';

const getGraphMode = state => state.getIn(['other', 'graphFunds', 'mode']);
const getEnabledList = state => state.getIn(['other', 'graphFunds', 'enabledList']);

function getFundItems(rows, enabledList) {
    const colors = rows.map((row, id) => colorKey(id))
        .set('overall', COLOR_GRAPH_FUND_LINE);

    return enabledList.map((enabled, id) => {
        const color = colors.get(id);

        const item = id === 'overall'
            ? 'Overall'
            : rows.getIn([id, 'cols', itemKey]);

        return map({ item, color, enabled });
    });
}

function getFundLines(times, timeOffsets, priceUnitsCosts, mode, enabledList) {
    return enabledList.reduce((last, enabled, id) => {
        if (!(enabled && times.get(id) && times.get(id).size > 1)) {
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

function getPriceUnitsCosts(rows, prices, startTime, cacheTimes) {
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
            prices: red.prices.set(id, thisPrices),
            units: red.units.set(id, thisUnits),
            costs: red.costs.set(id, thisCosts)
        };
    }, {
        prices: map.of(),
        units: map.of(),
        costs: map.of()
    });
}

const getFormattedHistory = createSelector([
    getFundsRows,
    getCurrentFundsCache,
    getGraphMode,
    getEnabledList
], (rows, cache, mode, enabledList) => {
    // get a formatted list of lines for display in the fund price / value graph

    const prices = cache.get('prices');
    const startTime = cache.get('startTime');
    const cacheTimes = cache.get('cacheTimes');

    const priceUnitsCosts = getPriceUnitsCosts(rows, prices, startTime, cacheTimes);

    const { timeOffsets, rowLengths, maxLength } = getRowLengths(prices);

    const times = rowLengths.reduce(
        (items, length, id) =>
            items.set(id, cacheTimes.slice(timeOffsets.get(id), timeOffsets.get(id) + length)),
        map({ overall: cacheTimes.slice(0, maxLength) })
    );

    const fundItems = getFundItems(rows, enabledList);

    const fundLines = getFundLines(times, timeOffsets, priceUnitsCosts, mode, enabledList);

    return { startTime, cacheTimes, fundItems, fundLines };
});

function getLines({ isMobile, fundLines, fundItems, mode }) {
    return fundLines.reduce((lines, item) => {
        const id = item.get('id');
        const mainLine = id === 'overall';
        if (isMobile && !mainLine && mode !== GRAPH_FUNDS_MODE_PRICE) {
            return lines;
        }

        const color = rgba(fundItems.getIn([item.get('id'), 'color']));

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

