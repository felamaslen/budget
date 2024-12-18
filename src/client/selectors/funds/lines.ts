import { replaceAtIndex } from 'replace-array';

import { GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { IDENTITY, lastInArray, rightPad } from '~client/modules/data';
import type { Data, Id, Point } from '~client/types';
import { FundMode } from '~client/types/enum';
import type { FundPriceGroup } from '~client/types/gql';
import type { GQL } from '~shared/types';

export type Return = {
  price: number;
  priceRebased: number;
  units: number;
  cost: number;
  realised: number;
};

export type FundWithReturns = { values: Return[]; startIndex: number };

export type FundsWithReturns = {
  [fundId in string]: FundWithReturns[];
};

export type FundGroup = GQL<FundPriceGroup>;

type ReturnMapper<I = undefined> = (value: Return, timeIndex: number, intermediate: I) => number;

type ReturnComposer = (prev: number, next: number) => number;

type ReduceReturnsAtDate = (funds: FundWithReturns[][], prev: number, timeIndex: number) => number;

function reduceReturnsAtDate(
  mapper: ReturnMapper,
  composer: ReturnComposer = (_, next): number => next,
): ReduceReturnsAtDate {
  return (funds, prevValue, timeIndex): number =>
    composer(
      prevValue,
      funds.reduce<number>((last, fund) => {
        const matchingGroup = fund.find(
          ({ startIndex, values }) =>
            startIndex <= timeIndex && values.length > timeIndex - startIndex,
        );

        return matchingGroup
          ? last +
              mapper(
                matchingGroup.values[timeIndex - matchingGroup.startIndex],
                timeIndex,
                undefined,
              )
          : last;
      }, 0),
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
      priceRebased: 0,
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

function mapSingleLine<I>(
  mapper: ReturnMapper<I>,
  getIntermediate?: (funds: FundsWithReturns) => I,
): (fundsWithReturns: FundsWithReturns, id: Id) => FundGroup[] {
  return (fundsWithReturns, id): FundGroup[] => {
    const intermediate = getIntermediate?.(fundsWithReturns) as I;
    return fundsWithReturns[id].map(({ values, startIndex }) => {
      const allValues = values.map((value, index) =>
        mapper(value, index + startIndex, intermediate),
      );
      const nonNanValues = allValues.filter((value) => !Number.isNaN(value));
      const firstNonNanValueIndex = allValues.findIndex((value) => !Number.isNaN(value));
      return {
        startIndex: startIndex + firstNonNanValueIndex,
        values: nonNanValues,
      };
    });
  };
}

const getValue = ({ units, priceRebased }: Return): number => units * priceRebased;
const getRealisedValue = ({ units, priceRebased, realised }: Return): number =>
  units * priceRebased + realised;
const getCost = ({ cost }: Return): number => cost;

const getROI = (cost: number, value: number): number => (100 * (value - cost)) / cost;
const roundROI = (value: number): number => Math.round(100 * value) / 100;

const reduceCost = reduceReturnsAtDate(getCost);
const reduceValue = reduceReturnsAtDate(getValue);
const reduceROI = reduceReturnsAtDate(getRealisedValue, getROI);

export const getOverallAbsolute = reduceOverallLine([reduceValue], Math.round);

export const getOverallROI = reduceOverallLine([reduceCost, reduceROI], roundROI);

export const getFundLineAbsolute = mapSingleLine(getValue);

export const getFundLineAllocation = mapSingleLine<number[]>(
  (fund, timeIndex, totalValues) => getValue(fund) / totalValues[timeIndex],
  (funds) =>
    reduceOverallLine([reduceValue])(funds).reduce<number[]>(
      (last, group) => [...last, ...Array(group.startIndex - last.length).fill(0), ...group.values],
      [],
    ),
);

export const getFundLineROI = mapSingleLine((returns) =>
  roundROI(getROI(getCost(returns), getRealisedValue(returns))),
);

export const getFundLinePrice = mapSingleLine((returns) => returns.priceRebased);

export const getFundLinePriceNormalised = (
  fundsWithReturns: FundsWithReturns,
  id: Id,
): FundGroup[] =>
  fundsWithReturns[id].map(({ values, startIndex }) => ({
    startIndex,
    values: values.map(
      ({ priceRebased }) => (priceRebased * 100) / fundsWithReturns[id][0].values[0].priceRebased,
    ),
  }));

export function getOverallLine(fundsWithReturns: FundsWithReturns, mode: FundMode): FundGroup[] {
  switch (mode) {
    case FundMode.Value:
    case FundMode.Stacked:
      return getOverallAbsolute(fundsWithReturns);
    case FundMode.Allocation:
      return getOverallAbsolute(fundsWithReturns).map((group) => ({
        ...group,
        values: Array(group.values.length).fill(1),
      }));
    case FundMode.Roi:
      return getOverallROI(fundsWithReturns);
    default:
      return [];
  }
}

export function getFundLine(
  fundsWithReturns: FundsWithReturns,
  mode: FundMode,
  id: Id,
): FundGroup[] {
  switch (mode) {
    case FundMode.Value:
    case FundMode.Stacked:
      return getFundLineAbsolute(fundsWithReturns, id);
    case FundMode.Allocation:
      return getFundLineAllocation(fundsWithReturns, id);
    case FundMode.Roi:
      return getFundLineROI(fundsWithReturns, id);
    case FundMode.Price:
      return getFundLinePrice(fundsWithReturns, id);
    case FundMode.PriceNormalised:
      return getFundLinePriceNormalised(fundsWithReturns, id);
    default:
      return [];
  }
}

export function getFundLineProcessed(
  fundsWithReturns: FundsWithReturns,
  cacheTimes: number[],
  mode: FundMode,
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
