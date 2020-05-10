/* eslint-disable @typescript-eslint/no-explicit-any */
import { unflatten } from 'flat';

export type DJMap<D extends object> = {
  internal: keyof D;
  external: string;
}[];

export function mapInternalToExternal<D extends object = object, J = object>(map: DJMap<D>) {
  return (dbResult: D): J =>
    unflatten(
      map.reduce((items: Partial<J>, { internal, external }) => {
        if (internal in items) {
          const { [internal]: value, ...rest } = items;

          return { ...rest, [external]: value };
        }

        return items;
      }, dbResult),
    );
}

type DeepObject = { [k: string]: any };

const isObject = (obj: DeepObject | any): obj is DeepObject => !!obj;

export function mapExternalToInternal<D extends object = object, J = object>(map: DJMap<D>) {
  return (jsObject: J): Partial<D> => {
    const result = map.reduce((items: DeepObject, { internal, external }) => {
      const keys: string[] = external.split('.');
      const deepValue = keys.reduce((obj: DeepObject | any, key: string) => {
        if (isObject(obj)) {
          return obj[key];
        }

        return obj;
      }, jsObject);

      if (typeof deepValue !== 'undefined') {
        const { [keys[0]]: discard, ...rest } = items;

        return { ...rest, [internal]: deepValue };
      }

      return items;
    }, jsObject);

    return result as Partial<D>;
  };
}
