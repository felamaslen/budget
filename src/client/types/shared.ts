import type { ListItemInput } from './gql';

export type PickUnion<T extends Record<string, unknown>, K extends keyof T> = { [P in K]: T[P] };
export type PickRequire<T extends Record<string, unknown>, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export type Id = number;

export type FieldKey<I extends ListItemInput> = keyof I;

export type GQL<T> = Omit<T, '__typename'>;

export type GQLDeep<T> = T extends Record<string, unknown>
  ? {
      [K in keyof GQL<T>]: GQLDeep<T[K]>;
    }
  : T;
