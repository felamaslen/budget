import type { ListItemInput } from './gql';

export type Id = number;

export type FieldKey<I extends ListItemInput> = keyof I;
