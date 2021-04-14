import type { NativeDate } from './crud';
import type { ListItemStandard, ListItemStandardInput } from './gql';
import type { GQL } from './shared';

export type ListItemStandardNative = NativeDate<GQL<ListItemStandard>, 'date'>;
export type StandardInput = NativeDate<GQL<ListItemStandardInput>, 'date'>;
