import type { Create } from '~shared/types';

export type PromiseResolvedType<T> = T extends Promise<infer R> ? R : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsyncReturnType<T extends (...args: any) => any> = PromiseResolvedType<ReturnType<T>>;

export type MaybePromise<T> = T | Promise<T>;

export type Item = {
  id: number;
};

export type Update<V> = Create<V> & Item;

export type WithRequiredJoin<
  T extends Record<string, unknown>,
  U extends Record<string, unknown | null>,
  StillNullable extends keyof U = never,
> = T extends U
  ? Omit<T, keyof U> & {
      [K in keyof U]: K extends StillNullable ? U[K] : NonNullable<U[K]>;
    }
  : never;
