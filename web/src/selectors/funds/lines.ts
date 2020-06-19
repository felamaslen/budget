import { GRAPH_FUNDS_OVERALL_ID, Mode } from '~client/constants/graph';
import { leftPad, rightPad, IDENTITY } from '~client/modules/data';
import { separateLines } from '~client/modules/funds';
import { Data } from '~client/types';

type Return = {
  price: number;
  units: number;
  cost: number;
};

export type FundsWithReturns = {
  [id in string]: { returns: Return[]; startIndex: number };
};

const maximiseAllLines = <T>(
  fundsWithReturns: FundsWithReturns,
  mapReturns: (returns: Return) => T,
  fillLeft: T,
  fillRight: (returns: Return) => T,
): T[][] => {
  const funds = Object.values(fundsWithReturns);
  const maxLength = funds.reduce(
    (last, { returns, startIndex }) => Math.max(last, returns.length + startIndex),
    0,
  );

  return funds.map<T[]>(({ returns, startIndex }) =>
    rightPad(
      leftPad(returns.map(mapReturns), startIndex + returns.length, fillLeft),
      maxLength,
      fillRight(returns[returns.length - 1]),
    ),
  );
};

export function getOverallAbsolute(fundsWithReturns: FundsWithReturns): number[] {
  const result = maximiseAllLines(
    fundsWithReturns,
    ({ price, units }) => price * units,
    0,
    () => 0,
  ).reduce(
    (last, values) => values.map((value, index) => Math.round(value + (last[index] ?? 0))),
    [],
  );
  return result;
}

export function getFundLineAbsolute(fundsWithReturns: FundsWithReturns, id: string): number[] {
  return fundsWithReturns[id].returns.map(({ price, units }) => price * units);
}

export function getOverallROI(fundsWithReturns: FundsWithReturns): number[] {
  return maximiseAllLines(
    fundsWithReturns,
    IDENTITY,
    {
      price: 0,
      units: 0,
      cost: 0,
    },
    (returns) => ({
      price: 0,
      units: 0,
      cost: returns.cost,
    }),
  )
    .reduce<{ value: number; cost: number }[]>(
      (last, returns) =>
        returns.map(({ price, units, cost }, index) => ({
          value: price * units + (last[index]?.value ?? 0),
          cost: cost + (last[index]?.cost ?? 0),
        })),
      [],
    )
    .map<number>(({ value, cost }) => Math.round((10000 * (value - cost)) / cost) / 100);
}

export function getFundLineROI(fundsWithReturns: FundsWithReturns, id: string): number[] {
  return fundsWithReturns[id].returns.map(({ price, units, cost }) =>
    price && units && cost ? Math.round((10000 * (price * units - cost)) / cost) / 100 : 0,
  );
}

export function getOverallLine(fundsWithReturns: FundsWithReturns, mode: Mode): number[] {
  if (mode === Mode.Value) {
    return getOverallAbsolute(fundsWithReturns);
  }
  if (mode === Mode.ROI) {
    return getOverallROI(fundsWithReturns);
  }
  return [];
}

export function getFundLine(fundsWithReturns: FundsWithReturns, mode: Mode, id: string): number[] {
  if (mode === Mode.Value) {
    return getFundLineAbsolute(fundsWithReturns, id);
  }
  if (mode === Mode.ROI) {
    return getFundLineROI(fundsWithReturns, id);
  }
  if (mode === Mode.Price) {
    return fundsWithReturns[id].returns.map(({ price }) => price);
  }

  return [];
}

export function getFundLineProcessed(
  fundsWithReturns: FundsWithReturns,
  cacheTimes: number[],
  mode: Mode,
  id: string = GRAPH_FUNDS_OVERALL_ID,
): Data[] {
  const line =
    id === GRAPH_FUNDS_OVERALL_ID
      ? getOverallLine(fundsWithReturns, mode)
      : getFundLine(fundsWithReturns, mode, id);

  const timeOffset = fundsWithReturns[id]?.startIndex ?? 0;

  const lineWithTimes: Data = line.map((value, index) => [cacheTimes[index + timeOffset], value]);
  return separateLines(lineWithTimes);
}
