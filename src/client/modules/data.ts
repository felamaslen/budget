import { compose } from '@typed/compose';
import isAfter from 'date-fns/isAfter';
import omit from 'lodash/omit';
import { replaceAtIndex } from 'replace-array';
import shortid from 'shortid';
import numericHash from 'string-hash';

import { toISO } from './format';

import type {
  Data,
  FundInputNative,
  Item,
  NativeFund,
  NetWorthEntryNative,
  StockSplitNative,
  TransactionNative,
} from '~client/types';
import type {
  Fund,
  FundInput,
  Income,
  IncomeDeductionInput,
  IncomeInput,
  ListItem,
  NetWorthEntryInput,
} from '~client/types/gql';
import { calculateTransactionCost } from '~shared/funds';
import type { Create, GQL, GQLShallow, NativeDate, RawDate } from '~shared/types';
import { omitTypeName } from '~shared/utils';

export type Identity<I, O = I> = (state: I) => O;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const IDENTITY: Identity<any, any> = (state) => state;
export const NULL = (): null => null;
export const VOID = (): void => {
  // pass
};

export const generateFakeId = (): number => -Math.abs(numericHash(shortid.generate()) >>> 1);

export function lastInArray<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

export const cumulativeSum = (array: number[]): number[] =>
  array.reduce<number[]>(
    (last, value, index) => [...last, value + (index > 0 ? last[last.length - 1] : 0)],
    [],
  );

const roundTotal = (value: number): number => Number(value.toFixed(4));

export const combineStockSplits = (stockSplits: Pick<StockSplitNative, 'ratio'>[]): number =>
  stockSplits.reduce<number>((product, { ratio }) => product * ratio, 1);

export function getUnitRebase(stockSplits: StockSplitNative[], transactionDate: Date): number {
  return combineStockSplits(stockSplits.filter((split) => isAfter(split.date, transactionDate)));
}

export function getTotalUnits(
  transactions: TransactionNative[],
  stockSplits: StockSplitNative[] = [],
): number {
  return roundTotal(
    transactions.reduce<number>(
      (last, { date, units }) => last + units * getUnitRebase(stockSplits, date),
      0,
    ),
  );
}

export const getTotalCost = (transactions: TransactionNative[]): number =>
  roundTotal(
    transactions.reduce<number>(
      (last, transaction) => last + calculateTransactionCost(transaction),
      0,
    ),
  );

export const isSold = (transactionsList: TransactionNative[]): boolean =>
  transactionsList.length > 0 && getTotalUnits(transactionsList) === 0;

export const partialModification = <T>(items: T[], index: number, delta: Partial<T>): T[] =>
  replaceAtIndex(items, index, (old) => ({ ...old, ...delta }));

export function linearRegression(line: number[]): { slope: number; intercept: number } {
  const sumX = line.reduce<number>((last, _, index) => last + index + 1, 0);
  const sumX2 = line.reduce<number>((last, _, index) => last + (index + 1) ** 2, 0);
  const sumXY = line.reduce<number>((last, value, index) => last + value * (index + 1), 0);
  const sumY = line.reduce<number>((last, value) => last + value, 0);

  const Sxy = sumXY - (sumX * sumY) / line.length;
  const Sxx = sumX2 - sumX ** 2 / line.length;

  const xBar = sumX / line.length;
  const yBar = sumY / line.length;

  const slope = Sxy / Sxx;
  const intercept = yBar - slope * xBar;
  return { slope, intercept };
}

export function exponentialRegression(line: number[]): {
  slope: number;
  intercept: number;
  logValues: number[];
  points: number[];
} {
  const logValues = line.filter((value) => value > 0).map(Math.log);
  if (!logValues.length) {
    return { slope: 0, intercept: 0, logValues: [], points: [] };
  }

  const { slope, intercept } = linearRegression(logValues);

  const points = line.map((_, index) => Math.exp(slope * (index + 1) + intercept));

  return { slope, intercept, logValues, points };
}

export const limitTimeSeriesLength = (timeSeries: Data, limit: number): Data =>
  new Array(timeSeries.length).fill(0).reduce((last) => {
    if (last.length <= limit) {
      return last;
    }

    const [closestIndex] = last.slice(1).reduce(
      (
        [closest, interval]: [number, number],
        [time]: [number, number],
        index: number,
      ): [number, number] => {
        const thisInterval = time - last[index][0];
        if (thisInterval < interval) {
          return [index, thisInterval];
        }

        return [closest, interval];
      },
      [1, Infinity],
    );

    return last.slice(0, closestIndex).concat(last.slice(closestIndex + 1));
  }, timeSeries);

export const randnBm = (): number =>
  Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());

type SortKey<K extends string> = K | { key: K; order: -1 | 1 };
function sortKey<K extends string, I extends { [key in K]?: number | string | Date }>(
  criteria: SortKey<K>,
  itemA: I,
  itemB: I,
): -1 | 1 | 0 {
  const key: K = typeof criteria === 'object' ? criteria.key : criteria;
  const order = typeof criteria === 'object' ? criteria.order : 1;

  if (itemA[key] < itemB[key]) {
    return -order as -1 | 1;
  }
  if (itemA[key] > itemB[key]) {
    return order;
  }

  return 0;
}

export const sortByKey =
  <K extends string, I extends { [key in K]?: number | string | Date }>(...keys: SortKey<K>[]) =>
  (items: I[]): I[] =>
    [...items].sort((itemA, itemB) =>
      keys.reduce((last, key) => last || sortKey(key, itemA, itemB), 0),
    );

const asTimestamp = (date: string | Date): number =>
  (date instanceof Date ? date : new Date(date)).getTime();

export const sortByDate = <I extends { date: string | Date }>(items: I[]): I[] =>
  [...items].sort(({ date: dateA }, { date: dateB }) => asTimestamp(dateA) - asTimestamp(dateB));

export const sortByTotal = <R extends { total: number }>(items: R[]): R[] =>
  sortByKey<'total', R>({ key: 'total', order: -1 })(items);

export const leftPad = <T>(array: T[], length: number, fill: T = 0 as unknown as T): T[] =>
  Array(Math.max(0, length - array.length))
    .fill(fill)
    .concat(array);

export const rightPad = <T>(array: T[], length: number, fill?: T): T[] =>
  array.concat(
    Array<T>(Math.max(0, length - array.length)).fill(
      fill ?? lastInArray(array) ?? (0 as unknown as T),
    ),
  );

export const withoutId = <T extends Partial<Item>>({ id, ...rest }: T): Omit<T, 'id'> => rest;
export const withoutIds = <T extends Partial<ListItem>>(items: T[]): Omit<T, 'id'>[] =>
  items.map(withoutId);

export const withNativeDate =
  <K extends string, T extends Record<K, string>>(...keys: K[]) =>
  (item: T): NativeDate<T, K> =>
    keys.reduce<NativeDate<T, K>>(
      (last, key) => ({ ...last, [key]: new Date(item[key]) }),
      item as NativeDate<T, K>,
    );

export const withRawDate =
  <K extends string, T extends Record<K, Date>>(...keys: K[]) =>
  (item: T): RawDate<T, K> =>
    keys.reduce<RawDate<T, K>>(
      (last, key) => ({ ...last, [key]: toISO(item[key]) }),
      item as RawDate<T, K>,
    );

export const toNativeFund = <F extends GQLShallow<Omit<Fund, 'id'>>>(input: F): NativeFund<F> => ({
  ...omitTypeName(input),
  transactions: input.transactions.map(compose(omitTypeName, withNativeDate('date'))),
  stockSplits: input.stockSplits.map(compose(omitTypeName, withNativeDate('date'))),
});

export const toRawFund = (input: FundInputNative): FundInput => ({
  ...input,
  transactions: input.transactions.map(withRawDate('date')),
  stockSplits: input.stockSplits.map(withRawDate('date')),
});

export const toRawIncome = (
  input: NativeDate<Income, 'date'> | NativeDate<IncomeInput, 'date'>,
): IncomeInput =>
  omit(
    {
      ...input,
      date: toISO(input.date),
      deductions: (input.deductions as GQL<IncomeDeductionInput>[]).map(omitTypeName),
    },
    'id',
    '__typename',
  );

export const toRawNetWorthEntry = (input: Create<NetWorthEntryNative>): NetWorthEntryInput => ({
  ...input,
  date: toISO(input.date),
  values: input.values.map((valueObject) => omit(valueObject, 'value')),
});
