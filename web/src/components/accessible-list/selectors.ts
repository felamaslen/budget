import { compose } from '@typed/compose';
import differenceInDays from 'date-fns/differenceInDays';
import memoize from 'moize';
import { createSelector } from 'reselect';

import { State } from './types';
import { IDENTITY, withoutDeleted, withoutCrud, sortByKey } from '~client/modules/data';
import { State as CrudState } from '~client/reducers/crud';
import { DailyState } from '~client/reducers/list';
import { ListItem, Item, WithCrud } from '~client/types';

export type StateStandard<I extends ListItem, P extends string> = {
  [page in P]: DailyState<I>;
};

export const getStandardCost = memoize(
  <I extends ListItem, P extends string, S extends StateStandard<I, P>>(page: P) => (
    state: S,
  ): number => state[page].total,
);

const getRawItems = <I extends Item, P extends string>(page: P) => (
  state: State<I, P>,
): CrudState<I> => state[page].items;

type SortItems<I extends Item> = (items: I[]) => I[];
export const getItems = memoize(
  <I extends Item, P extends string>(page: P, sortItems: SortItems<I> = IDENTITY) =>
    createSelector(
      getRawItems<I, P>(page),
      compose<CrudState<I>, I[], I[], I[]>(sortItems, withoutCrud, withoutDeleted),
    ),
);

export const getItem = memoize(<I extends Item, P extends string>(page: P, id: string) => {
  const processItem = memoize((item: I): I => item, {
    maxSize: 1,
    isReact: true,
  });

  return (state: State<I, P>): I => {
    const { __optimistic, ...rest } = state[page].items.find((item) => item.id === id) as WithCrud<
      I
    >;
    return processItem(rest as I);
  };
});

export const sortStandardItems = memoize(<I extends ListItem>() =>
  sortByKey<'id' | 'date', I>({ key: 'date', order: -1 }, 'id'),
);

export const getWeeklyCost = memoize(
  <I extends ListItem, P extends string, S extends StateStandard<I, P>>(page: P) =>
    createSelector<S, I[], number>(
      getItems<I, P>(page, sortStandardItems<I>()),
      (items: ListItem[]): number => {
        // note that this is calculated only based on the visible data,
        // not past data
        if (!items.length) {
          return 0;
        }

        const visibleTotal = items.reduce((sum, { cost }) => sum + cost, 0);

        const lastDate = items[0]?.date; // sorted descending
        const firstDate = items[items.length - 1]?.date;

        const numWeeks = differenceInDays(lastDate, firstDate) / 7;
        if (!numWeeks) {
          return 0;
        }

        return Math.round(visibleTotal / numWeeks);
      },
    ),
);
