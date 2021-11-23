import { formatISO } from 'date-fns';
import omit from 'lodash/omit';
import type { NativeDate, OptionalDeep, RawDate } from './types';

export const omitTypeName = <T extends Record<string, unknown>>(item: T): Omit<T, '__typename'> =>
  omit(item, '__typename');

type OmitDeep<T, U extends string> = T extends Record<string, unknown>
  ? { [K in keyof Omit<T, U>]: OmitDeep<T[K], U> }
  : T;

export function omitDeep<T, K extends string>(item: T | T[], key: K): OmitDeep<T, K> {
  if (Array.isArray(item)) {
    return item.map((i) => omitDeep(i, key)) as unknown as OmitDeep<T, K>;
  }
  if (typeof item === 'object' && item !== null) {
    return Object.entries(omit(item as Record<string, unknown>, key)).reduce<OmitDeep<T, K>>(
      (last, [objectKey, value]) => ({
        ...last,
        [objectKey]: omitDeep(value, key),
      }),
      {} as OmitDeep<T, K>,
    );
  }
  return item as OmitDeep<T, K>;
}

export function optionalDeep<T, K extends string>(item: T | T[], key: K): OptionalDeep<T, K> {
  if (Array.isArray(item)) {
    return item.map((i) => optionalDeep(i, key)) as unknown as OptionalDeep<T, K>;
  }
  if (typeof item === 'object' && item !== null) {
    return Object.entries(item as Record<string, unknown>).reduce<OptionalDeep<T, K>>(
      (last, [objectKey, value]) =>
        objectKey === key && value === null
          ? last
          : { ...last, [objectKey]: optionalDeep(value, key) },
      {} as OptionalDeep<T, K>,
    );
  }
  return item as OptionalDeep<T, K>;
}

export const coalesceKeys = <T extends Partial<Record<K, unknown>>, K extends string>(
  obj: T,
  ...keys: K[]
): T => keys.reduce<T>((last, key) => ({ ...last, [key]: last[key] ?? null }), obj);

export const enum Average {
  Mean,
  Median,
  Exp,
}

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

export const roundObject = <T extends Record<string, number>>(obj: T): T =>
  Object.entries(obj).reduce<T>(
    (last, [key, value]) => ({ ...last, [key]: Math.round(value) }),
    obj,
  );

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
      (last, key) => ({ ...last, [key]: formatISO(item[key], { representation: 'date' }) }),
      item as RawDate<T, K>,
    );
