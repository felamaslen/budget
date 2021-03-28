import addYears from 'date-fns/addYears';
import differenceInMonths from 'date-fns/differenceInMonths';
import endOfMonth from 'date-fns/endOfMonth';
import isBefore from 'date-fns/isBefore';
import isSameMonth from 'date-fns/isSameMonth';
import moize from 'moize';
import { createSelector } from 'reselect';

import { getCashTotal, getEndDate, getEntries, getStartDate } from './direct';
import { currentDayIsEndOfMonth, mapMonthDates } from './utils';

import { GRAPH_CASHFLOW_LONG_TERM_PREDICTION_YEARS } from '~client/constants';
import { getMonthDatesList, inclusiveMonthDifference } from '~client/modules/date';
import type { State as CrudState } from '~client/reducers/crud';
import type { State } from '~client/reducers/types';
import { withoutDeleted } from '~client/selectors/crud';
import { getRawItems } from '~client/selectors/list';
import type {
  ListItemStandardNative,
  ListItemExtendedNative,
  NativeDate,
  OverviewGraphDate as GraphDate,
  CashTotalNative,
  LongTermOptions,
} from '~client/types';
import { PageListStandard } from '~client/types/enum';
import type { ListItemStandard } from '~client/types/gql';

export { getAnnualisedFundReturns, getCashTotal, getEndDate, getStartDate } from './direct';

export const getNumMonths = createSelector(getStartDate, getEndDate, inclusiveMonthDifference);

export const getFutureMonths = moize(
  (today: Date): ((state: State) => number) =>
    createSelector(getEndDate, (endDate) => differenceInMonths(endDate, today)),
  { maxSize: 1 },
);

export const getMonthDates = createSelector(getStartDate, getEndDate, getMonthDatesList);

export const getStartPredictionIndex = moize(
  (today: Date) =>
    createSelector(
      getNumMonths,
      getFutureMonths(today),
      getEntries,
      (numMonths, futureMonths, entries) => {
        const isEndOfMonth = currentDayIsEndOfMonth(today);
        const predictCurrentMonth =
          !isEndOfMonth && !entries.some((entry) => isSameMonth(entry.date, today));
        return Math.max(1, numMonths - futureMonths - (predictCurrentMonth ? 1 : 0));
      },
    ),
  { maxSize: 1 },
);

export const getGraphDates = moize(
  (today: Date, longTermOptions: LongTermOptions) =>
    createSelector(getStartDate, getMonthDates, (startDate, monthDates) => {
      if (!longTermOptions.enabled) {
        return mapMonthDates(monthDates);
      }

      const presentGraphDates = mapMonthDates(getMonthDatesList(startDate, endOfMonth(today)));

      return Array(longTermOptions.rates.years ?? GRAPH_CASHFLOW_LONG_TERM_PREDICTION_YEARS)
        .fill(0)
        .reduce<GraphDate[]>(
          (last, _, index) => [
            ...last,
            {
              date: addYears(presentGraphDates[presentGraphDates.length - 1].date, index + 1),
              monthIndex: presentGraphDates.length - 1 + (index + 1) * 12,
            },
          ],
          presentGraphDates,
        );
    }),
  { maxSize: 1 },
);

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
