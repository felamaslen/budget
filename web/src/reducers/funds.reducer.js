/**
 * Process funds data
 */

import { List as list, Map as map } from 'immutable';
import {
    COLOR_GRAPH_FUND_LINE, COLOR_FUND_UP, COLOR_FUND_DOWN
} from '../misc/config';
import {
    PAGES, GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_MODE_ABSOLUTE, GRAPH_FUNDS_MODE_PRICE
} from '../misc/const';
import { colorKey } from '../misc/color';
import { formatAge } from '../misc/format';

const transactionsKey = PAGES.funds.cols.indexOf('transactions');
const itemKey = PAGES.funds.cols.indexOf('item');

export function getFundsCachedValueAgeText(startTime, cacheTimes, now) {
    const age = (now.getTime() / 1000) - cacheTimes.last() - startTime;

    return formatAge(age);
}
export function getFundsCachedValue(rows, startTime, cacheTimes, now) {

    const value = rows.reduce((sum, row) => {
        if (!row.get('pr').size) {
            return sum;
        }

        return sum + (
            row.get('pr').last() * row.getIn(['cols', transactionsKey]).getTotalUnits()
        );
    }, 0);

    const ageText = getFundsCachedValueAgeText(startTime, cacheTimes, now);

    return map({ ageText, value });
}

export function getFundColor(value, min, max) {
    const color = value > 0
        ? COLOR_FUND_UP
        : COLOR_FUND_DOWN;

    const range = value > 0
        ? max
        : min;

    if (value === 0 || Math.abs(range) === 0) {
        return [255, 255, 255];
    }

    return color.map(
        channel => Math.round(255 + (value / range) * (channel - 255))
    );
}

export function getRowsWithPrices(rows) {
    return rows.reduce((keys, row, key) => {
        if (row.has('pr') && row.get('pr').size > 0) {
            return keys.push(key);
        }

        return keys;
    }, list.of());
}

export function getRowGains(rows, rowsWithPrices, startTime, cacheTimes) {
    const roundGain = value => Math.round(10000 * value) / 10000;
    const roundAbs = value => Math.round(value);

    return rows.reduce((obj, row, key) => {
        if (!rowsWithPrices.includes(key)) {
            return obj;
        }

        const prices = row.get('pr');
        const timeOffset = row.get('prStartIndex');
        const transactions = row.getIn(['cols', transactionsKey]);

        const price = prices.last();
        const units = transactions.getLastUnits();
        const cost = transactions.getLastCost();
        const value = price * units;

        const gainAbs = roundAbs(value - cost);
        const gain = roundGain((value - cost) / cost);

        let dayGainAbs = 0;
        let dayGain = 0;

        if (prices.size > 1) {
            const yesterdayPriceTime = startTime + cacheTimes.get(timeOffset + prices.size - 2);
            const transactionsToYesterday = transactions.filter(
                item => item.get('date') < yesterdayPriceTime
            );

            const yesterdayPrice = prices.get(prices.size - 2);

            const yesterdayUnits = transactionsToYesterday.getLastUnits();
            const yesterdayCost = transactionsToYesterday.getLastCost();
            const yesterdayValue = yesterdayUnits * yesterdayPrice;

            dayGainAbs = roundAbs(value - yesterdayValue);
            dayGain = roundGain((value - yesterdayValue) / yesterdayCost);
        }

        return {
            values: obj.values.push(value),
            gains: obj.gains.push(gain),
            dayGains: obj.dayGains.push(dayGain),
            gainsAbs: obj.gainsAbs.push(gainAbs),
            dayGainsAbs: obj.dayGainsAbs.push(dayGainAbs)
        };

    }, {
        values: list.of(),
        gains: list.of(),
        dayGains: list.of(),
        gainsAbs: list.of(),
        dayGainsAbs: list.of()
    });
}

export function getGains(rows, startTime, cacheTimes) {
    const rowsWithPrices = getRowsWithPrices(rows);

    const { gains, dayGains, gainsAbs, dayGainsAbs, values } =
        getRowGains(rows, rowsWithPrices, startTime, cacheTimes);

    const min = gains.min();
    const max = gains.max();

    return rows.map((row, rowKey) => {
        const key = rowsWithPrices.indexOf(rowKey);

        if (key === -1) {
            return row;
        }

        const value = values.get(key);

        const gain = gains.get(key);
        const gainAbs = gainsAbs.get(key);

        const dayGain = dayGains.get(key);
        const dayGainAbs = dayGainsAbs.get(key);

        const color = getFundColor(gains.get(key), min, max);

        return row.set('gain', map({
            value, gain, gainAbs, dayGain, dayGainAbs, color
        }));
    });
}

function getPricesForRow(row, startTime, cacheTimes) {
    const prices = row.get('pr');
    const prStartIndex = row.get('prStartIndex');

    const history = prices.map((price, key) => {
        return list([startTime + cacheTimes.get(key + prStartIndex), price]);
    });

    return history;
}

export function getRowHistory(rows, startTime, cacheTimes) {
    return rows.map(row => row.set(
        'prices', getPricesForRow(row, startTime, cacheTimes)
    ));
}

export function getExtraRowProps(rows, startTime, cacheTimes) {
    const rowsWithGains = getGains(rows, startTime, cacheTimes);

    const rowsWithPriceHistory = getRowHistory(rowsWithGains, startTime, cacheTimes);

    return rowsWithPriceHistory;
}

export function zoomFundLines(linesAll, zoom) {
    // restrict fund lines by zooming
    const minX = zoom.get(0);
    const maxX = zoom.get(1);

    if (minX === null || maxX === null) {
        return linesAll.slice();
    }

    const lines = linesAll
        .map(line => {
            const points = line.get('line');

            return line.set('line', points.filter((point, pointKey) => {
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
        })
        .filter(line => line.get('line').size > 1);

    return lines;
}

export function getOverallAbsolute(prices, units) {
    // get the overall absolute value for each time point
    return prices.reduce((lineSum, fundPrices, key) => {
        const fundValues = fundPrices.map((price, timeKey) => {
            return price * units.getIn([key, timeKey]);
        });

        const bigLine = fundValues.size > lineSum.size
            ? fundValues
            : lineSum;

        const smallLine = fundValues.size > lineSum.size
            ? lineSum
            : fundValues;

        return bigLine
            .slice(0, smallLine.size)
            .map((value, timeKey) => value + smallLine.get(timeKey))
            .concat(bigLine.slice(smallLine.size));
    }, list.of());
}

export function getFundLineAbsolute(prices, units, index) {
    // get the absolute value of a fund at each time point
    return prices.get(index).map((price, timeKey) => {
        return price * units.getIn([index, timeKey]);
    });
}

function getROI(values, costs) {
    // convert a series of values and costs into a series of return-on-investment values
    return values.map((value, timeKey) => {
        const cost = costs.get(timeKey);
        if (!cost) {
            return 0;
        }

        return 100 * (value - cost) / cost;
    });
}

export function getOverallROI(prices, units, costs) {
    // get the overall return on investment for each time point
    const values = getOverallAbsolute(prices, units);

    const overallCosts = values.map((value, timeKey) => {
        return costs.reduce((sum, row) => {
            if (row.size < timeKey + 1) {
                return sum;
            }

            return sum + row.get(timeKey);
        }, 0);
    });

    return getROI(values, overallCosts);
}

export function getFundLineROI(prices, units, costs, index) {
    // get the return on investment of a fund at each time point
    const values = getFundLineAbsolute(prices, units, index);

    const fundCosts = values.map((value, timeKey) => {
        return costs.getIn([index, timeKey]);
    });

    return getROI(values, fundCosts);
}

export function getFundLinePrice(prices, index) {
    // simple: get the price of a fund at each time point
    return prices.get(index);
}

export function getOverallLine(prices, units, costs, mode, timeOffsets) {
    const addOffsets = item => item.map((itemList, rowKey) => {
        return list(new Array(timeOffsets.get(rowKey)).fill(0))
            .concat(itemList);
    });

    const pricesWithOffsets = addOffsets(prices);
    const unitsWithOffsets = addOffsets(units);
    const costsWithOffsets = addOffsets(costs);

    if (mode === GRAPH_FUNDS_MODE_ABSOLUTE) {
        return getOverallAbsolute(
            pricesWithOffsets, unitsWithOffsets, costsWithOffsets
        );
    }

    if (mode === GRAPH_FUNDS_MODE_ROI) {
        return getOverallROI(
            pricesWithOffsets, unitsWithOffsets, costsWithOffsets
        );
    }

    return null;
}

export function getFundLine(prices, units, costs, mode, index) {
    if (mode === GRAPH_FUNDS_MODE_ABSOLUTE) {
        return getFundLineAbsolute(prices, units, index);
    }

    if (mode === GRAPH_FUNDS_MODE_ROI) {
        return getFundLineROI(prices, units, costs, index);
    }

    if (mode === GRAPH_FUNDS_MODE_PRICE) {
        return getFundLinePrice(prices, index);
    }

    return null;
}

export function getFundLineProcessed(
    times, timeOffsets, prices, units, costs, mode, index
) {
    const line = index > -1
        ? getFundLine(prices, units, costs, mode, index)
        : getOverallLine(prices, units, costs, mode, timeOffsets);

    if (!line) {
        return null;
    }

    const lineIndex = index + 1;

    const lineWithTimes = line.map((value, key) => list([times.get(key), value]));

    return map({
        line: lineWithTimes,
        index: lineIndex
    });
}

export function getFundLines(times, timeOffsets, prices, units, costs, mode, fundsEnabled) {
    let lines = list.of();

    const fundsValid = fundsEnabled.filter(index => {
        return times.get(index + 1).size > 1;
    });

    if (fundsValid.includes(-1)) {
        lines = lines.push(getFundLineProcessed(
            times.first(), timeOffsets, prices, units, costs, mode, -1)
        );
    }

    return lines
        .concat(fundsValid
            .filter(index => index > -1)
            .map(index => getFundLineProcessed(
                times.get(index + 1), null, prices, units, costs, mode, index
            ))
        )
        .filter(item => item !== null);
}

function getPriceUnitsCosts(rows, startTime, cacheTimes) {
    return rows.reduce((obj, row) => {
        const transactions = row.getIn(['cols', transactionsKey]);

        const thisPrices = row.get('pr');
        const timeOffset = row.get('prStartIndex');

        const { thisUnits, thisCosts } = thisPrices.reduce((red, price, priceKey) => {
            const time = cacheTimes.get(priceKey + timeOffset);

            const transactionsToNow = transactions
                .filter(item => item.get('date') < startTime + time);

            const thisPriceUnits = transactionsToNow.getTotalUnits();
            const thisPriceCost = transactionsToNow.getTotalCost();

            return {
                thisUnits: red.thisUnits.push(thisPriceUnits),
                thisCosts: red.thisCosts.push(thisPriceCost)
            };
        }, {
            thisUnits: list.of(),
            thisCosts: list.of()
        });

        return {
            prices: obj.prices.push(thisPrices),
            units: obj.units.push(thisUnits),
            costs: obj.costs.push(thisCosts)
        };
    }, {
        prices: list.of(),
        units: list.of(),
        costs: list.of()
    });
}

export function getFormattedHistory(rowsMap, mode, startTime, cacheTimes, zoom, enabledList = null) {
    // get a formatted list of lines for display in the fund price / value graph
    const rows = rowsMap.toList();

    const timeOffsets = rows.map(row => row.get('prStartIndex'));

    const rowLengths = rows.map((row, index) => {
        return row.get('pr').size + timeOffsets.get(index);
    });

    const maxLength = rowLengths.max();

    const fundsEnabled = enabledList || rowLengths
        .reduce((keys, length, key) => {
            if (length >= maxLength) {
                return keys.push(key);
            }

            return keys;
        }, list.of())
        .push(-1);

    const { prices, units, costs } = getPriceUnitsCosts(
        rows, startTime, cacheTimes
    );

    const times = list([
        list(new Array(maxLength).fill(0))
            .map((item, key) => cacheTimes.get(key))
    ])
        .concat(rowLengths.map((length, index) => {
            const timeOffset = timeOffsets.get(index);

            return list(new Array(length).fill(0))
                .map((item, key) => cacheTimes.get(key + timeOffset));
        }));

    const colors = list([COLOR_GRAPH_FUND_LINE]).concat(rows.map(
        (row, key) => colorKey(key + 1)
    ));

    // for the list of funds on the sidebar
    const fundItems = list([
        map({
            item: 'Overall',
            enabled: fundsEnabled.includes(-1)
        })
    ])
        .concat(rows.map((row, key) => map({
            item: row.getIn(['cols', itemKey]),
            enabled: fundsEnabled.includes(key)
        })))
        .map((item, key) => item.set('color', colors.get(key)));

    const fundLinesAll = getFundLines(
        times, timeOffsets, prices, units, costs, mode, fundsEnabled
    );

    const fundLines = zoomFundLines(fundLinesAll, zoom);

    return map({ fundItems, fundLines, fundLinesAll });
}

