import { NativeDate } from './crud';
import { ListItemExtended, ListItemStandard, ListItemStandardInput } from './gql';
import { GQL } from './shared';

export type ListItemStandardNative = NativeDate<GQL<ListItemStandard>, 'date'>;
export type ListItemExtendedNative = NativeDate<GQL<ListItemExtended>, 'date'>;
export type StandardInput = NativeDate<GQL<ListItemStandardInput>, 'date'>;
