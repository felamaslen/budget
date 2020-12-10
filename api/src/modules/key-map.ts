/* eslint-disable @typescript-eslint/no-explicit-any */
import { unflatten } from 'flat';

type Row = {
  [x: string]: any;
};

export type DJMap<D extends Row> = {
  internal: keyof D;
  external: string;
}[];

export function mapInternalToExternal<D extends Row = Row, J extends Row = Row>(map: DJMap<D>) {
  return (dbResult: D): J =>
    unflatten(
      map.reduce<J>((items, { internal, external }) => {
        if (internal in items) {
          const { [internal]: value, ...rest } = items;

          return { ...rest, [external]: value } as J;
        }

        return items;
      }, (dbResult as unknown) as J),
    );
}

type DeepObject = { [k: string]: any };

const isObject = (obj: DeepObject | any): obj is DeepObject => !!obj;

export function mapExternalToInternal<D extends Row = Row, J extends Row = Row>(map: DJMap<D>) {
  return (jsObject: J): D => {
    const result = map.reduce<DeepObject>((items, { internal, external }) => {
      const keys: string[] = (external as string).split('.');
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

    return result as D;
  };
}
