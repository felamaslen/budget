import type { ListItemInput } from './gql';

export type Id = number;

export type FieldKey<I extends ListItemInput> = keyof I;

export type GQL<T> = Omit<T, '__typename'>;

export type GQLDeep<T> = T extends Record<string, unknown>
  ? {
      [K in keyof GQL<T>]: GQLDeep<T[K]>;
    }
  : T;
