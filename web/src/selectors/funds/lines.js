import { List as list, Map as map } from 'immutable';
import {
    GRAPH_FUNDS_OVERALL_ID,
    GRAPH_FUNDS_MODE_ROI,
    GRAPH_FUNDS_MODE_ABSOLUTE,
    GRAPH_FUNDS_MODE_PRICE
} from '~client/constants/graph';

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

export function getFundLineAbsolute(prices, units, id) {
    // get the absolute value of a fund at each time point
    return prices.get(id).map((price, timeKey) => {
        return price * units.getIn([id, timeKey]);
    });
}

function getROI(values, costs) {
    // convert a series of values and costs into a series of return-on-investment values
    return values.map((value, timeKey) => {
        const cost = costs.get(timeKey);
        if (!(cost && value)) {
            return 0;
        }

        return 100 * (value - cost) / cost;
    });
}

export function getOverallROI(prices, units, costs) {
    // get the overall return on investment for each time point
    const values = getOverallAbsolute(prices, units);

    const overallCosts = values.map((value, timeKey) => {
        return costs.reduce((sum, row, fundKey) => {
            if (row.size < timeKey + 1 || prices.getIn([fundKey, timeKey]) === 0) {
                return sum;
            }

            return sum + row.get(timeKey);
        }, 0);
    });

    return getROI(values, overallCosts);
}

export function getFundLineROI({ prices, units, costs }, id) {
    // get the return on investment of a fund at each time point
    const values = getFundLineAbsolute(prices, units, id);

    const fundCosts = values.map((value, timeKey) => costs.getIn([id, timeKey]));

    return getROI(values, fundCosts);
}

export function getOverallLine(priceUnitsCosts, mode, timeOffsets) {
    const addOffsets = item => item.map((itemList, rowKey) => {
        return list(new Array(timeOffsets.get(rowKey)).fill(0))
            .concat(itemList);
    });

    const { prices, units, costs } = priceUnitsCosts;

    const pricesWithOffsets = addOffsets(prices);
    const unitsWithOffsets = addOffsets(units);
    const costsWithOffsets = addOffsets(costs);

    if (mode === GRAPH_FUNDS_MODE_ABSOLUTE) {
        return getOverallAbsolute(pricesWithOffsets, unitsWithOffsets);
    }

    if (mode === GRAPH_FUNDS_MODE_ROI) {
        return getOverallROI(pricesWithOffsets, unitsWithOffsets, costsWithOffsets);
    }

    return null;
}

export function getFundLine(priceUnitsCosts, mode, id) {
    if (mode === GRAPH_FUNDS_MODE_ABSOLUTE) {
        const { prices, units } = priceUnitsCosts;

        return getFundLineAbsolute(prices, units, id);
    }

    if (mode === GRAPH_FUNDS_MODE_ROI) {
        return getFundLineROI(priceUnitsCosts, id);
    }

    if (mode === GRAPH_FUNDS_MODE_PRICE) {
        return priceUnitsCosts.prices.get(id);
    }

    return null;
}

export function getFundLineProcessed(times, timeOffsets, priceUnitsCosts, mode, id) {
    const overall = id === GRAPH_FUNDS_OVERALL_ID;

    const line = overall
        ? getOverallLine(priceUnitsCosts, mode, timeOffsets)
        : getFundLine(priceUnitsCosts, mode, id);

    if (!line) {
        return null;
    }

    const lineWithTimes = line.map((value, key) => list([times.get(key), value]));

    return map({
        prices: overall
            ? null
            : priceUnitsCosts.prices.get(id),
        line: lineWithTimes,
        id
    });
}

