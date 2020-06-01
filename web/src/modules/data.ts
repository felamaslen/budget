import formatDate from 'date-fns/format';
import { replaceAtIndex } from 'replace-array';
import shortid from 'shortid';

import { Average } from '~client/constants';
import { PeriodObject, Period } from '~client/constants/graph';
import { IdMap, Item } from '~client/types';
import { RequestType, WithCrud, Create } from '~client/types/crud';
import { TransactionRaw as TransactionRawNew, Transaction } from '~client/types/funds';
import { Data as Line } from '~client/types/graph';

type TransactionRaw = Omit<TransactionRawNew, 'date'> & {
  date: Date | string;
};

export type Identity<I, O = I> = (state: I) => O;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const IDENTITY: Identity<any, any> = (state) => state;
export const NULL = (): null => null;
export const VOID = (): void => {
  // pass
};

export function getPeriodMatch(
  shortPeriod: string | Period,
  defaultPeriod = process.env.DEFAULT_FUND_PERIOD,
): PeriodObject {
  const matchingPeriod = Object.entries(Period).find(([, match]) => match === shortPeriod);
  if (matchingPeriod) {
    return getPeriodMatch(matchingPeriod[0]);
  }

  const periodRegex = /^([a-z]+)([0-9]+)$/;
  const match = shortPeriod.match(periodRegex) || (defaultPeriod ?? '').match(periodRegex);
  if (!match) {
    return { period: 'year', length: 1 };
  }

  return { period: match[1], length: Number(match[2]) };
}

export const getTransactionsList = (data: TransactionRaw[]): Transaction[] =>
  data.map(
    ({ date, units, cost }: TransactionRaw): Transaction => ({
      id: shortid.generate(),
      date: new Date(date),
      units: Number(units) || 0,
      cost: Number(cost) || 0,
    }),
  );

const getRoundedTotal = <K extends string, I extends {} = {}>(key: K) => (
  array: (I & { [key in K]: number })[],
): number =>
  Number(array.reduce((sum: number, { [key]: value }): number => sum + value, 0).toFixed(4));

export const getTotalUnits = getRoundedTotal<'units', Transaction>('units');
export const getTotalCost = getRoundedTotal<'cost', Transaction>('cost');

export const isSold = (transactionsList: Transaction[]): boolean =>
  getTotalUnits(transactionsList) === 0;

export const addToTransactionsList = (
  transactionsList: Transaction[],
  item: Create<Transaction>,
): Transaction[] => [
  ...transactionsList,
  {
    ...item,
    id: shortid.generate(),
  },
];

export const modifyTransaction = (
  transactionsList: Transaction[],
  index: number,
  delta: Partial<Transaction>,
): Transaction[] =>
  replaceAtIndex(transactionsList, index, (oldItem) => ({ ...oldItem, ...delta }));

export const modifyTransactionById = (
  transactionsList: Transaction[],
  id: string,
  delta: Partial<Transaction>,
): Transaction[] =>
  modifyTransaction(
    transactionsList,
    transactionsList.findIndex(({ id: itemId }) => itemId === id),
    delta,
  );

export const formatTransactionsList = (transactionsList: Transaction[]): TransactionRaw[] =>
  [...transactionsList]
    .sort(({ date: dateA }, { date: dateB }) => Number(dateA) - Number(dateB))
    .map(({ date, units, cost }) => ({
      date: formatDate(date, 'yyyy-MM-dd'),
      units,
      cost,
    }));

export function arrayAverage(values: number[], mode: Average = Average.Mean): number {
  if (!values.length) {
    return NaN;
  }
  if (mode === Average.Median) {
    const sorted = [...values].sort((prev, next) => prev - next);

    const oddLength = sorted.length & 1;
    if (oddLength) {
      // odd: get the middle value
      return sorted[Math.floor((sorted.length - 1) / 2)];
    }

    // even: get the middle two values and find the average of them
    const low = sorted[Math.floor(sorted.length / 2) - 1];
    const high = sorted[Math.floor(sorted.length / 2)];

    return (low + high) / 2;
  }
  if (mode === Average.Exp) {
    const weights = new Array(values.length)
      .fill(0)
      .map((_, index) => 2 ** -(index + 1))
      .reverse();

    const weightSum = weights.reduce((sum, value) => sum + value, 0);

    return (
      values.reduce((average, value, index) => average + value * weights[index], 0) / weightSum
    );
  }

  // mean
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export const limitTimeSeriesLength = (timeSeries: Line, limit: number): Line =>
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

export const isDate = <I extends Item, F extends keyof I>(value?: I[F] | Date): value is Date =>
  typeof value === 'undefined' || value instanceof Date;

export const isTransactions = <I extends Item, F extends keyof I>(
  value?: I[F] | Transaction[],
): value is Transaction[] => value === null || Array.isArray(value);

export const isNumber = <I extends Item, F extends keyof I>(
  value?: I[F] | number,
): value is number => typeof value === 'undefined' || typeof value === 'number';

export function getValueFromTransmit(dataType: 'date', value: string): Date;
export function getValueFromTransmit(dataType: 'cost', value: string): number;
export function getValueFromTransmit(
  dataType: 'transactions',
  value: TransactionRaw[],
): Transaction[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getValueFromTransmit(dataType: string, value: any): string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getValueFromTransmit(dataType: string, value: any): any {
  if (dataType === 'date') {
    return new Date(value);
  }
  if (dataType === 'cost') {
    return parseInt(value, 10) || 0;
  }
  if (dataType === 'transactions') {
    return getTransactionsList(value);
  }

  return String(value);
}

export function getValueForTransmit(dataType: 'date', value: Date): string;
export function getValueForTransmit(
  dataType: 'transactions',
  value: Transaction[],
): TransactionRaw[];
export function getValueForTransmit(dataType: 'item', value: string): string;
export function getValueForTransmit(dataType: 'category', value: string): string;
export function getValueForTransmit(dataType: 'cost', value: number): number;
export function getValueForTransmit(dataType: 'shop', value: string): string;
export function getValueForTransmit(dataType: 'holiday', value: string): string;
export function getValueForTransmit(dataType: 'social', value: string): string;

export function getValueForTransmit(dataType: string, value: string): string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getValueForTransmit(dataType: string, value: any): any {
  if (dataType === 'date') {
    return formatDate(value, 'yyyy-MM-dd');
  }
  if (dataType === 'transactions') {
    return formatTransactionsList(value);
  }

  return getValueFromTransmit(dataType, value);
}

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

export const sortByKey = <K extends string, I extends { [key in K]?: number | string | Date }>(
  ...keys: SortKey<K>[]
) => (items: I[]): I[] =>
  [...items].sort((itemA, itemB) =>
    keys.reduce((last, key) => last || sortKey(key, itemA, itemB), 0),
  );

const asTimestamp = (date: string | Date): number =>
  (date instanceof Date ? date : new Date(date)).getTime();

export const sortByDate = <I extends { date: string | Date }>(items: I[]): I[] =>
  [...items].sort(({ date: dateA }, { date: dateB }) => asTimestamp(dateA) - asTimestamp(dateB));

export const sortByTotal = <R extends { total: number }>(items: R[]): R[] =>
  sortByKey<'total', R>({ key: 'total', order: -1 })(items);

export const leftPad = (array: number[], length: number, fill = 0): number[] =>
  Array(Math.max(0, length - array.length))
    .fill(fill)
    .concat(array);

export const rightPad = (array: number[], length: number, fill?: number): number[] =>
  array.concat(
    Array(Math.max(0, length - array.length)).fill(fill ?? array[array.length - 1] ?? 0),
  );

export const withoutCrud = <T extends object>(items: WithCrud<T>[]): T[] =>
  items.map(({ __optimistic, ...item }: WithCrud<T>): T => item as T);

export const withoutDeleted = <T>(items: WithCrud<T>[]): WithCrud<T>[] =>
  (items || []).filter(({ __optimistic }) => __optimistic !== RequestType.delete);

export const withoutId = <T extends { id?: string }>({ id, ...rest }: T): Omit<T, 'id'> => rest;
export const withoutIds = <T extends { id?: string }>(items: T[]): Omit<T, 'id'>[] =>
  items.map(withoutId);

export const toIdMap = <V extends { id: string }>(items: V[]): IdMap<V> =>
  items.reduce(
    (last, item) => ({
      ...last,
      [item.id]: item,
    }),
    {},
  );