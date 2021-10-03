import omit from 'lodash/omit';
import type { OptionalDeep } from './types';

export const omitTypeName = <T extends Record<string, unknown>>(item: T): Omit<T, '__typename'> =>
  omit(item, '__typename');

type OmitDeep<T, U extends string> = T extends Record<string, unknown>
  ? { [K in keyof Omit<T, U>]: OmitDeep<T[K], U> }
  : T;

export function omitDeep<T, K extends string>(item: T | T[], key: K): OmitDeep<T, K> {
  if (Array.isArray(item)) {
    return (item.map((i) => omitDeep(i, key)) as unknown) as OmitDeep<T, K>;
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
    return (item.map((i) => optionalDeep(i, key)) as unknown) as OptionalDeep<T, K>;
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
