import type { ListItemStandard, ListItemStandardInput } from './gql';
import type { GQL, NativeDate } from '~shared/types';

export type ListItemStandardNative = NativeDate<GQL<ListItemStandard>, 'date'>;
export type StandardInput = NativeDate<GQL<ListItemStandardInput>, 'date'>;
