import { ListItemInput } from './gql';
import { Create } from './shared';

export type TypeMap<I extends ListItemInput> = Record<keyof Create<I>, string>;

export type ColumnMap<I extends Record<string, unknown>> = { [key: string]: keyof I };
