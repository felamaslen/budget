import { compose } from '@typed/compose';
import isSameDay from 'date-fns/isSameDay';
import moize from 'moize';
import { createSelector } from 'reselect';

import type { CustomSelector, DailyRecord, State } from './types';
import { IDENTITY, sortByKey } from '~client/modules/data';
import { State as CrudState } from '~client/reducers/crud';
import { DailyState } from '~client/reducers/list';
import { withoutDeleted } from '~client/selectors/crud';
import { getRawItems } from '~client/selectors/list';
import type { GQL, Id, ListItemStandardNative as ListItemStandard, PageList } from '~client/types';
import type { ListItem, ListItemInput, PageListStandard } from '~client/types/gql';

export type StateStandard<I extends ListItemStandard, P extends string> = {
  [page in P]: DailyState<I>;
};

export const getStandardCost = moize(
  <S extends StateStandard<ListItemStandard, PageListStandard>>(page: PageListStandard) => (
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

export const sortStandardItems = sortByKey<'item' | 'date', ListItemStandard>(
  { key: 'date', order: -1 },
  'item',
);

export const getWeeklyCost = moize(
  <I extends ListItemStandard, P extends string, S extends StateStandard<I, P>>(page: P) => (
    state: S,
  ): number => state[page].weekly,
);

export const dailySelector: CustomSelector<ListItemStandard, DailyRecord> = moize(
  (sortedItems: GQL<ListItemStandard>[]): Record<Id, DailyRecord> =>
    sortedItems.reduce<{ dailySum: number; record: Record<Id, DailyRecord> }>(
      (last, { id, date, cost }, index) => {
        if (index === sortedItems.length - 1 || !isSameDay(date, sortedItems[index + 1].date)) {
          return {
            dailySum: 0,
            record: { ...last.record, [id]: { dailyTotal: last.dailySum + cost } },
          };
        }

        return { dailySum: last.dailySum + cost, record: last.record };
      },
      {
        dailySum: 0,
        record: {},
      },
    ).record,
  { maxSize: 1 },
);
