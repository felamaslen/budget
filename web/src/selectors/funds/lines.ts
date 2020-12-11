import { replaceAtIndex } from 'replace-array';

import { GRAPH_FUNDS_OVERALL_ID, Mode } from '~client/constants/graph';
import { IDENTITY, lastInArray, rightPad } from '~client/modules/data';
import { Data, FundPriceGroup, GQL, Id, Point } from '~client/types';

export type Return = {
  price: number;
  units: number;
  cost: number;
  realised: number;
};

export type FundWithReturns = { values: Return[]; startIndex: number };

export type FundsWithReturns = {
  [fundId in string]: FundWithReturns[];
};

type FundGroup = GQL<FundPriceGroup>;

type ReturnMapper = (value: Return) => number;

type ReturnComposer = (prev: number, next: number) => number;

type ReduceReturnsAtDate = (funds: FundWithReturns[][], prev: number, timeIndex: number) => number;

function reduceReturnsAtDate(
  mapper: ReturnMapper,
  composer: ReturnComposer = (_, next): number => next,
): ReduceReturnsAtDate {
  return (funds, prevValue, timeIndex): number =>
    composer(
      prevValue,
      funds.reduce<number>(
        (last, fund) =>
          fund
            .filter(
              ({ startIndex, values }) =>
                timeIndex >= startIndex && values.length > timeIndex - startIndex,
            )
            .reduce<number>(
              (fundLast, { startIndex, values }) =>
                fundLast + mapper(values[timeIndex - startIndex]),
              last,
            ),
        0,
      ),
    );
}

function extendCosts(funds: FundWithReturns[][]): FundWithReturns[][] {
  const maxLength = funds.reduce<number>(
    (last, groups) =>
      groups.reduce<number>(
        (groupLast, group) => Math.max(groupLast, group.startIndex + group.values.length),
        last,
      ),
    0,
  );

  return funds.map<FundWithReturns[]>((group) => {
    const lastReturn = lastInArray(group);
    if (!lastReturn) {
      return group;
    }

    const lastValue = lastInArray(lastReturn.values);
    if (!lastValue) {
      return group;
    }

    const continueValue: Return = {
      cost: lastValue.cost,
      realised: lastValue.realised,
      price: 0,
      units: 0,
    };

    return replaceAtIndex(group, group.length - 1, (last) => ({
      ...last,
      values: rightPad(last.values, maxLength - last.startIndex, continueValue),
    }));
  });
}

function reduceOverallLine(
  reducers: ReduceReturnsAtDate[],
  composer: (value: number) => number = IDENTITY,
): (fundsWithReturns: FundsWithReturns) => FundGroup[] {
  return (fundsWithReturns): FundGroup[] => {
    const funds = extendCosts(Object.values(fundsWithReturns));

    const groupLength = funds.reduce<number>(
      (last, groups) =>
        groups.reduce<number>(
          (groupLast, group) => Math.max(groupLast, group.startIndex + group.values.length),
          last,
        ),
      0,
    );

    const minStartIndex = funds.reduce<number>(
      (last, groups) =>
        groups.reduce<number>((groupLast, group) => Math.min(groupLast, group.startIndex), last),
      Infinity,
    );

    if (minStartIndex === Infinity) {
      return [{ startIndex: 0, values: [] }];
    }

    const values = reducers
      .reduce<number[]>(
        (last, reducer) => last.map((prevValue, timeIndex) => reducer(funds, prevValue, timeIndex)),
        Array(groupLength).fill(0),
      )
      .map(composer);

    return [{ values, startIndex: 0 }];
  };
}

function mapSingleLine(
  mapper: ReturnMapper,
): (fundsWithReturns: FundsWithReturns, id: Id) => FundGroup[] {
  return (fundsWithReturns, id): FundGroup[] =>
    fundsWithReturns[id].map(({ values, startIndex }) => ({
      startIndex,
      values: values.map(mapper),
    }));
}

const getValue = ({ units, price }: Return): number => units * price;
const getRealisedValue = ({ units, price, realised }: Return): number => units * price + realised;
const getCost = ({ cost }: Return): number => cost;

const getROI = (cost: number, value: number): number => (100 * (value - cost)) / cost;
const roundROI = (value: number): number => Math.round(100 * value) / 100;

const reduceCost = reduceReturnsAtDate(getCost);
const reduceValue = reduceReturnsAtDate(getValue);
const reduceROI = reduceReturnsAtDate(getRealisedValue, getROI);

export const getOverallAbsolute = reduceOverallLine([reduceValue], Math.round);

export const getOverallROI = reduceOverallLine([reduceCost, reduceROI], roundROI);

export const getFundLineAbsolute = mapSingleLine(getValue);

export const getFundLineROI = mapSingleLine((returns) =>
  roundROI(getROI(getCost(returns), getRealisedValue(returns))),
);

export const getFundLinePrice = mapSingleLine((returns) => returns.price);

export const getFundLinePriceNormalised = (
  fundsWithReturns: FundsWithReturns,
  id: Id,
): FundGroup[] =>
  fundsWithReturns[id].map(({ values, startIndex }) => ({
    startIndex,
    values: values.map(({ price }) => (price * 100) / fundsWithReturns[id][0].values[0].price),
  }));

export function getOverallLine(fundsWithReturns: FundsWithReturns, mode: Mode): FundGroup[] {
  if (mode === Mode.Value) {
    return getOverallAbsolute(fundsWithReturns);
  }
  if (mode === Mode.ROI) {
    return getOverallROI(fundsWithReturns);
  }
  return [];
}

export function getFundLine(fundsWithReturns: FundsWithReturns, mode: Mode, id: Id): FundGroup[] {
  switch (mode) {
    case Mode.Value:
      return getFundLineAbsolute(fundsWithReturns, id);
    case Mode.ROI:
      return getFundLineROI(fundsWithReturns, id);
    case Mode.Price:
      return getFundLinePrice(fundsWithReturns, id);
    case Mode.PriceNormalised:
      return getFundLinePriceNormalised(fundsWithReturns, id);
    default:
      return [];
  }
}

export function getFundLineProcessed(
  fundsWithReturns: FundsWithReturns,
  cacheTimes: number[],
  mode: Mode,
  id: Id = GRAPH_FUNDS_OVERALL_ID,
): Data[] {
  const groups =
    id === GRAPH_FUNDS_OVERALL_ID
      ? getOverallLine(fundsWithReturns, mode)
      : getFundLine(fundsWithReturns, mode, id);

  return groups.map<Data>(({ startIndex, values }) =>
    values.map<Point>((value, index) => [cacheTimes[startIndex + index], value]),
  );
}
