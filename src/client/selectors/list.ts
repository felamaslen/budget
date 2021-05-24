import moize from 'moize';

import { isStandardListPage } from '~client/constants/data';
import type { State } from '~client/reducers';
import type { State as CrudState } from '~client/reducers/crud';
import type { ListState } from '~client/reducers/list';
import type { ListItemStandardNative } from '~client/types';
import type { ListItem, PageListStandard } from '~client/types/gql';
import type { GQL } from '~shared/types';

export type ApiListState<I extends ListItem, P extends string> = Record<P, ListState<I>> &
  Partial<Pick<State, 'api'>>;

export const getRawItems = <
  I extends GQL<ListItem> = ListItemStandardNative,
  P extends string = PageListStandard
>(
  page: P,
) => (state: ApiListState<I, P>): CrudState<I> => state[page];

export const getOlderExists = moize(<P extends string>(page: P) => (state: State): boolean =>
  isStandardListPage(page) ? !!state[page].olderExists : false,
);

export const getListOffset = moize(<P extends string>(page: P) => (state: State): number =>
  isStandardListPage(page) ? state[page].offset : 0,
);
