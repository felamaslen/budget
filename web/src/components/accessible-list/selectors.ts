import { compose } from '@typed/compose';
import moize from 'moize';
import { createSelector } from 'reselect';

import { State } from './types';
import { IDENTITY, sortByKey } from '~client/modules/data';
import { State as CrudState } from '~client/reducers/crud';
import { DailyState } from '~client/reducers/list';
import { withoutDeleted } from '~client/selectors/crud';
import { getRawItems } from '~client/selectors/list';
import {
  Id,
  ListItem,
  ListItemInput,
  ListItemStandardNative as ListItemStandard,
  PageList,
} from '~client/types';

export type StateStandard<I extends ListItemStandard, P extends string> = {
  [page in P]: DailyState<I>;
};

export const getStandardCost = moize(
  <I extends ListItemStandard, P extends string, S extends StateStandard<I, P>>(page: P) => (
    state: S,
  ): number => state[page].total,
);

type SortItems<I extends ListItemInput> = (items: I[]) => I[];

export const getItems = moize(
  <I extends ListItem, P extends string>(page: P, sortItems: SortItems<I> = IDENTITY) =>
    createSelector(
      getRawItems<I, P>(page),
      compose<CrudState<I>, I[], I[], I[]>(
        moize(IDENTITY, {
          maxSize: 1,
          isSerialized: true,
        }),
        sortItems,
        withoutDeleted,
      ),
    ),
);

export const getItem = moize(
  <I extends ListItem, P extends PageList>(page: P, id: Id) => (state: State<I, P>): I =>
    state[page].items.find((item) => item.id === id) as I,
);

export const sortStandardItems = moize(<I extends ListItemStandard>() =>
  sortByKey<'item' | 'date', I>({ key: 'date', order: -1 }, 'item'),
);

export const getWeeklyCost = moize(
  <I extends ListItemStandard, P extends string, S extends StateStandard<I, P>>(page: P) => (
    state: S,
  ): number => state[page].weekly,
);
