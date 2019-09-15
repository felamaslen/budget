import { separateLines } from '~client/modules/funds';
import {
    GRAPH_FUNDS_OVERALL_ID,
    GRAPH_FUNDS_MODE_ROI,
    GRAPH_FUNDS_MODE_ABSOLUTE,
    GRAPH_FUNDS_MODE_PRICE,
} from '~client/constants/graph';

export function getOverallAbsolute(prices, units) {
    // get the overall absolute value for each time point
    return Object.keys(prices).reduce((lineSum, id) => {
        const fundValues = prices[id].map((price, timeIndex) => price * units[id][timeIndex]);

        const [bigLine, smallLine] = fundValues.length > lineSum.length
            ? [fundValues, lineSum]
            : [lineSum, fundValues];

        return bigLine
            .slice(0, smallLine.length)
            .map((value, timeIndex) => value + smallLine[timeIndex])
            .concat(bigLine.slice(smallLine.length));
    }, []);
}

export function getFundLineAbsolute(prices, units, id) {
    // get the absolute value of a fund at each time point
    return prices[id].map((price, timeIndex) => price * units[id][timeIndex]);
}

function getROI(values, costs) {
    // convert a series of values and costs into a series of return-on-investment values
    return values.map((value, timeIndex) => {
        const cost = costs[timeIndex];
        if (!(cost && value)) {
            return 0;
        }

        return 100 * ((value - cost) / cost);
    });
}

export function getOverallROI(prices, units, costs) {
    // get the overall return on investment for each time point
    const values = getOverallAbsolute(prices, units);

    const overallCosts = values.map((value, timeIndex) => Object.keys(costs).reduce((sum, id) => {
        if (costs[id].length < timeIndex + 1 || prices[id][timeIndex] === 0) {
            return sum;
        }

        return sum + costs[id][timeIndex];
    }, 0));

    return getROI(values, overallCosts);
}

export function getFundLineROI({ prices, units, costs }, id) {
    // get the return on investment of a fund at each time point
    const values = getFundLineAbsolute(prices, units, id);
    const fundCosts = values.map((value, timeIndex) => costs[id][timeIndex]);

    return getROI(values, fundCosts);
}

export function getOverallLine(priceUnitsCosts, mode, timeOffsets) {
    const withOffsets = (item) => Object.keys(item).reduce((last, id) => ({
        ...last,
        [id]: new Array(timeOffsets[id]).fill(0)
            .concat(item[id]),
    }), {});

    const { prices, units, costs } = priceUnitsCosts;

    const pricesWithOffsets = withOffsets(prices);
    const unitsWithOffsets = withOffsets(units);
    const costsWithOffsets = withOffsets(costs);

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
        return priceUnitsCosts.prices[id];
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

    const lineWithTimes = line.map((value, index) => ([times[index], value]));

    return separateLines(lineWithTimes);
}
