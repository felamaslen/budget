import type { ListItemInput } from './gql';

export type PickUnion<T extends Record<string, unknown>, K extends keyof T> = { [P in K]: T[P] };
export type PickRequire<T extends Record<string, unknown>, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export type RequiredNotNull<T> = T extends Record<string, unknown>
  ? Required<
      {
        [K in keyof T]: RequiredNotNull<T[K]>;
      }
    >
  : NonNullable<T>;

export type Id = number;

export type FieldKey<I extends ListItemInput> = keyof I;

export type GQL<T> = Omit<T, '__typename'>;

export type GQLDeep<T> = T extends Record<string, unknown>
  ? {
      [K in keyof GQL<T>]: GQLDeep<T[K]>;
    }
  : T;
