import differenceInMonths from 'date-fns/differenceInMonths';
import endOfMonth from 'date-fns/endOfMonth';
import isBefore from 'date-fns/isBefore';
import isSameDay from 'date-fns/isSameDay';
import isSameMonth from 'date-fns/isSameMonth';
import moize from 'moize';
import { createSelector } from 'reselect';
import { ListItemStandard } from '~api/types';

import { GRAPH_SPEND_CATEGORIES } from '~client/constants/graph';
import { getMonthDatesList, inclusiveMonthDifference } from '~client/modules/date';
import type { State as CrudState } from '~client/reducers/crud';
import type { State } from '~client/reducers/types';
import { withoutDeleted } from '~client/selectors/crud';
import { getRawItems } from '~client/selectors/list';
import type {
  PageNonStandard,
  CostProcessed,
  ListItemStandardNative,
  ListItemExtendedNative,
  NativeDate,
} from '~client/types';
import { PageListStandard } from '~client/types/enum';
import type { Cost } from '~client/types/gql';

export const getCost = (state: State): Cost => state.overview.cost;

const spendingCategories = GRAPH_SPEND_CATEGORIES.map(({ name }) => name);

export const getSpendingColumn = <K extends keyof CostProcessed = never>(dates: Date[]) => (
  data: Cost & Pick<CostProcessed, K>,
): Cost & Pick<CostProcessed, K> & Pick<CostProcessed, 'spending'> => ({
  ...data,
  spending: dates.map((_: Date, index) =>
    spendingCategories.reduce((sum, category) => sum + (data[category]?.[index] ?? 0), 0),
  ),
});

export const getStartDate = (state: Pick<State, PageNonStandard.Overview>): Date =>
  state.overview.startDate;
export const getEndDate = (state: Pick<State, PageNonStandard.Overview>): Date =>
  state.overview.endDate;

export const getNumMonths = createSelector(getStartDate, getEndDate, inclusiveMonthDifference);

export const getFutureMonths = moize(
  (today: Date): ((state: State) => number) =>
    createSelector(getEndDate, (endDate) => differenceInMonths(endDate, today)),
  {
    maxSize: 1,
  },
);

export const getMonthDates = createSelector(getStartDate, getEndDate, getMonthDatesList);

export const currentDayIsEndOfMonth = (today: Date): boolean => isSameDay(endOfMonth(today), today);

const getPageCostForMonthSoFar = <I extends NativeDate<ListItemStandard, 'date'>>(
  today: Date,
  items: CrudState<I>,
): number =>
  withoutDeleted(items)
    .filter(({ date }) => isSameMonth(date, today) && isBefore(date, today))
    .reduce<number>((last, { cost }) => last + cost, 0);

export const getCostForMonthSoFar = moize(
  (today: Date) =>
    createSelector<
      State,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      number
    >(
      getRawItems<ListItemStandardNative, PageListStandard.Income>(PageListStandard.Income),
      getRawItems<ListItemStandardNative, PageListStandard.Bills>(PageListStandard.Bills),
      getRawItems<ListItemExtendedNative, PageListStandard.Food>(PageListStandard.Food),
      getRawItems<ListItemExtendedNative, PageListStandard.General>(PageListStandard.General),
      getRawItems<ListItemExtendedNative, PageListStandard.Holiday>(PageListStandard.Holiday),
      getRawItems<ListItemExtendedNative, PageListStandard.Social>(PageListStandard.Social),
      (income, ...args) =>
        args.reduce(
          (last, items) => last + getPageCostForMonthSoFar(today, items),
          -getPageCostForMonthSoFar(today, income),
        ),
    ),
  { maxSize: 1 },
);
