import type { ListItemStandard, ListItemStandardInput, ListReadResponse } from './gql';
import type { GQL, NativeDate } from '~shared/types';

export type ListItemStandardNative = NativeDate<GQL<ListItemStandard>, 'date'>;
export type StandardInput = NativeDate<GQL<ListItemStandardInput>, 'date'>;

export type ListReadResponseNative<T extends GQL<ListItemStandard>> = Omit<
  GQL<ListReadResponse>,
  'items'
> & {
  items: T[];
};
