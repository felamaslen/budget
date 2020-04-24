import { separateLines } from '~client/modules/funds';
import { Data } from '~client/types/graph';
import {
  GRAPH_FUNDS_OVERALL_ID,
  Mode,
  GRAPH_FUNDS_MODE_ROI,
  GRAPH_FUNDS_MODE_ABSOLUTE,
  GRAPH_FUNDS_MODE_PRICE,
} from '~client/constants/graph';

export type PUC = {
  [fundId: string]: number[];
};

type Prices = PUC;
type Units = PUC;
type Costs = PUC;

export function getOverallAbsolute(prices: Prices, units: Units): number[] {
  // get the overall absolute value for each time point
  return Object.keys(prices).reduce((lineSum: number[], id) => {
    const fundValues = prices[id].map((price, timeIndex) => price * units[id][timeIndex]);

    const [bigLine, smallLine] =
      fundValues.length > lineSum.length ? [fundValues, lineSum] : [lineSum, fundValues];

    return bigLine
      .slice(0, smallLine.length)
      .map((value, timeIndex) => value + smallLine[timeIndex])
      .concat(bigLine.slice(smallLine.length));
  }, []);
}

export function getFundLineAbsolute(prices: Prices, units: Units, id: string): number[] {
  // get the absolute value of a fund at each time point
  return prices[id].map((price, timeIndex) => price * units[id][timeIndex]);
}

function getROI(values: number[], costs: number[]): number[] {
  // convert a series of values and costs into a series of return-on-investment values
  return values.map((value, timeIndex) => {
    const cost = costs[timeIndex];
    if (!(cost && value)) {
      return 0;
    }

    return 100 * ((value - cost) / cost);
  });
}

export function getOverallROI(prices: Prices, units: Units, costs: Costs): number[] {
  // get the overall return on investment for each time point
  const values = getOverallAbsolute(prices, units);

  const overallCosts = values.map((_, timeIndex) =>
    Object.keys(costs).reduce((sum, id) => {
      if (costs[id].length < timeIndex + 1 || prices[id][timeIndex] === 0) {
        return sum;
      }

      return sum + costs[id][timeIndex];
    }, 0),
  );

  return getROI(values, overallCosts);
}

type PriceUnitsCosts = {
  prices: Prices;
  units: Units;
  costs: Costs;
};

export function getFundLineROI({ prices, units, costs }: PriceUnitsCosts, id: string): number[] {
  // get the return on investment of a fund at each time point
  const values = getFundLineAbsolute(prices, units, id);
  const fundCosts = values.map((_, timeIndex) => costs[id][timeIndex]);

  return getROI(values, fundCosts);
}

export function getOverallLine(
  priceUnitsCosts: PriceUnitsCosts,
  mode: Mode,
  timeOffsets: { [fundId: string]: number },
): number[] | null {
  const withOffsets = (item: PUC): PUC =>
    Object.entries(item).reduce(
      (last: PUC, [id, values]: [string, number[]]): PUC => ({
        ...last,
        [id]: new Array(timeOffsets[id]).fill(0).concat(values),
      }),
      {},
    );

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

export function getFundLine(
  priceUnitsCosts: PriceUnitsCosts,
  mode: Mode,
  id: string,
): number[] | null {
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

export function getFundLineProcessed(
  times: number[],
  timeOffsets: { [fundId: string]: number },
  priceUnitsCosts: PriceUnitsCosts,
  mode: Mode,
  id: string,
): Data[] | null {
  const overall = id === GRAPH_FUNDS_OVERALL_ID;

  const line = overall
    ? getOverallLine(priceUnitsCosts, mode, timeOffsets)
    : getFundLine(priceUnitsCosts, mode, id);

  if (!line) {
    return null;
  }

  const lineWithTimes: Data = line.map((value, index) => [times[index], value]);

  return separateLines(lineWithTimes);
}
