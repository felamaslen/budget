import differenceInMonths from 'date-fns/differenceInMonths';
import endOfMonth from 'date-fns/endOfMonth';
import isBefore from 'date-fns/isBefore';
import isSameDay from 'date-fns/isSameDay';
import moize from 'moize';
import { createSelector } from 'reselect';

import { GRAPH_SPEND_CATEGORIES } from '~client/constants/graph';
import { getMonthDatesList, inclusiveMonthDifference } from '~client/modules/date';
import type { State as CrudState } from '~client/reducers/crud';
import type { State } from '~client/reducers/types';
import { withoutDeleted } from '~client/selectors/crud';
import { getRawItems } from '~client/selectors/list';
import {
  ListItemStandardNative,
  ListItemExtendedNative,
  NativeDate,
  PageNonStandard,
  MonthlyProcessed,
  MonthlyProcessedKey,
  MonthlyWithProcess,
  CashTotalNative,
} from '~client/types';
import { PageListStandard } from '~client/types/enum';
import type { ListItemStandard, Monthly } from '~client/types/gql';

export const getCashTotal = (state: State): CashTotalNative => state.netWorth.cashTotal;

export const roundedArrays = <T extends Record<string, unknown[]>>(items: T): T =>
  Object.entries(items).reduce<T>(
    (last, [key, values]) =>
      Array.isArray(values) ? { ...last, [key]: values.map(Math.round) } : last,
    items,
  );

export const roundedNumbers = <T extends Record<string, unknown>>(items: T): T =>
  Object.entries(items).reduce<T>(
    (last, [key, value]) =>
      typeof value === 'number' ? { ...last, [key]: Math.round(value) } : last,
    items,
  );

export const getMonthlyValues = (state: State): Monthly => state.overview.monthly;

const spendingCategories = GRAPH_SPEND_CATEGORIES.map(({ name }) => name);

export const getSpendingColumn = <K extends MonthlyProcessedKey = never>(dates: Date[]) => (
  data: MonthlyWithProcess<K>,
): MonthlyWithProcess<K> & Pick<MonthlyProcessed, 'spending'> => ({
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

const getPageCostSinceDate = <I extends NativeDate<ListItemStandard, 'date'>>(
  today: Date,
  since: Date,
  items: CrudState<I>,
): number =>
  withoutDeleted(items)
    .filter(({ date }) => isBefore(since, date) && isBefore(date, today))
    .reduce<number>((last, { cost }) => last + cost, 0);

export const getCostSinceCashTotals = moize(
  (today: Date) =>
    createSelector<
      State,
      CashTotalNative,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      number
    >(
      getCashTotal,
      getRawItems<ListItemStandardNative, PageListStandard.Income>(PageListStandard.Income),
      getRawItems<ListItemStandardNative, PageListStandard.Bills>(PageListStandard.Bills),
      getRawItems<ListItemExtendedNative, PageListStandard.Food>(PageListStandard.Food),
      getRawItems<ListItemExtendedNative, PageListStandard.General>(PageListStandard.General),
      getRawItems<ListItemExtendedNative, PageListStandard.Holiday>(PageListStandard.Holiday),
      getRawItems<ListItemExtendedNative, PageListStandard.Social>(PageListStandard.Social),
      ({ date: cashTotalDate }, income, ...args) =>
        cashTotalDate
          ? args.reduce(
              (last, items) => last + getPageCostSinceDate(today, cashTotalDate, items),
              -getPageCostSinceDate(today, cashTotalDate, income),
            )
          : 0,
    ),
  { maxSize: 1 },
);
