import { DateTime } from 'luxon';
import shortid from 'shortid';
import { replaceAtIndex } from 'replace-array';

import { RequestType, WithCrud } from '~client/types/crud';
import {
  TransactionRaw as TransactionRawNew,
  LegacyTransaction as Transaction,
} from '~client/types/funds';
import { Average } from '~client/constants';
import { PeriodObject } from '~client/constants/graph';
import { Data as Line } from '~client/types/graph';

type TransactionRaw = Omit<TransactionRawNew, 'date'> & {
  date: DateTime | string;
};

export type Identity<I, O = I> = (state: I) => O;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const IDENTITY: Identity<any, any> = state => state;

export const NULL = (): null => null;

export function getPeriodMatch(
  shortPeriod: string,
  defaultPeriod = process.env.DEFAULT_FUND_PERIOD,
): PeriodObject {
  const periodRegex = /^([a-z]+)([0-9]+)$/;
  const match = shortPeriod.match(periodRegex) || (defaultPeriod ?? '').match(periodRegex);
  if (!match) {
    return { period: 'year', length: 1 };
  }

  return { period: match[1], length: Number(match[2]) };
}

const dateAsDateTime = (date: DateTime | string): DateTime =>
  typeof date === 'string' ? DateTime.fromISO(date) : date;

export const getTransactionsList = (data: TransactionRaw[]): Transaction[] =>
  data.map(
    ({ date, units, cost }: TransactionRaw): Transaction => ({
      id: shortid.generate(),
      date: dateAsDateTime(date),
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
  item: TransactionRaw,
): Transaction[] => transactionsList.concat(getTransactionsList([item]));

export function modifyTransaction(
  transactionsList: Transaction[],
  index: number,
  item: Partial<TransactionRaw>,
): Transaction[] {
  const oldItem = transactionsList[index];
  const date = item.date ? dateAsDateTime(item.date) : oldItem.date;

  return replaceAtIndex(transactionsList, index, { ...oldItem, ...item, date });
}

export const modifyTransactionById = (
  transactionsList: Transaction[],
  id: string,
  item: Partial<TransactionRaw>,
): Transaction[] =>
  modifyTransaction(
    transactionsList,
    transactionsList.findIndex(({ id: itemId }) => itemId === id),
    item,
  );

export const formatTransactionsList = (transactionsList: Transaction[]): TransactionRaw[] =>
  transactionsList
    .sort(({ date: dateA }, { date: dateB }) => Number(dateA) - Number(dateB))
    .map(({ date, units, cost }) => ({
      date: date.toISODate(),
      units,
      cost,
    }));

export function arrayAverage(values: number[], mode: Average = Average.Mean): number {
  if (!values.length) {
    return NaN;
  }
  if (mode === Average.Median) {
    const sorted = values.slice().sort((prev, next) => prev - next);

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

export const sortByTotal = <R extends { total: number }>(rows: R[]): R[] =>
  rows.slice().sort(({ total: totalA }, { total: totalB }) => totalB - totalA);

export const limitTimeSeriesLength = (timeSeries: Line, limit: number): Line =>
  new Array(timeSeries.length).fill(0).reduce(last => {
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

export function getValueFromTransmit(dataType: 'date', value: string): DateTime;
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
    return DateTime.fromISO(value);
  }
  if (dataType === 'cost') {
    return parseInt(value, 10) || 0;
  }
  if (dataType === 'transactions') {
    return getTransactionsList(value);
  }

  return String(value);
}

export function getValueForTransmit(dataType: 'date', value: DateTime): string;
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
    return value.toISODate();
  }
  if (dataType === 'transactions') {
    return formatTransactionsList(value);
  }

  return getValueFromTransmit(dataType, value);
}

const asTimestamp = (date: string | Date | DateTime): number => {
  if (date instanceof DateTime) {
    return date.toMillis();
  }
  if (date instanceof Date) {
    return date.getTime();
  }
  return new Date(date).getTime();
};

export const sortByDate = <I extends { date: string | Date | DateTime }>(data: I[]): I[] =>
  data.sort(({ date: dateA }, { date: dateB }) => asTimestamp(dateA) - asTimestamp(dateB));

function sortKey<K extends string, I extends { [key in K]: number | string }>(
  key: K,
  itemA: I,
  itemB: I,
): -1 | 1 | 0 {
  if (itemA[key] < itemB[key]) {
    return -1;
  }
  if (itemA[key] > itemB[key]) {
    return 1;
  }

  return 0;
}

export const sortByKey = <K extends string, I extends { [key in K]: number | string }>(
  ...keys: K[]
) => (items: I[]): I[] =>
  items.sort((itemA, itemB) => keys.reduce((last, key) => last || sortKey(key, itemA, itemB), 0));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fieldExists = <V = never>(value?: V): boolean =>
  typeof value !== 'undefined' && !(typeof value === 'string' && !value.length);

export const leftPad = (array: number[], length: number): number[] =>
  new Array(Math.max(0, length - array.length)).fill(0).concat(array);

export const withoutDeleted = <T>(items: WithCrud<T>[]): WithCrud<T>[] =>
  (items || []).filter(({ __optimistic }) => __optimistic !== RequestType.delete);
