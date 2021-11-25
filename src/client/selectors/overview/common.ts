import addYears from 'date-fns/addYears';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import endOfMonth from 'date-fns/endOfMonth';
import endOfYear from 'date-fns/endOfYear';
import getMonth from 'date-fns/getMonth';
import isSameMonth from 'date-fns/isSameMonth';
import moize from 'moize';
import { createSelector } from 'reselect';

import { getEndDate, getEntries, getStartDate } from './direct';
import { currentDayIsEndOfMonth, mapMonthDates } from './utils';

import { GRAPH_CASHFLOW_LONG_TERM_PREDICTION_YEARS } from '~client/constants';
import { getMonthDatesList, inclusiveMonthDifference } from '~client/modules/date';
import type { State } from '~client/reducers/types';
import type { OverviewGraphDate, LongTermOptions } from '~client/types';

export { getAnnualisedFundReturns, getCashTotal, getEndDate, getStartDate } from './direct';

export const getNumMonths = createSelector(getStartDate, getEndDate, inclusiveMonthDifference);

export const getFutureMonths = moize(
  (today: Date): ((state: State) => number) =>
    createSelector(getEndDate, (endDate) => differenceInCalendarMonths(endDate, today)),
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

      const lastDate = presentGraphDates[presentGraphDates.length - 1].date;
      const longTermStartDate = endOfYear(addYears(lastDate, getMonth(lastDate) === 11 ? 1 : 0));
      const initialMonthIndex =
        differenceInCalendarMonths(longTermStartDate, lastDate) + presentGraphDates.length - 1;

      return Array(longTermOptions.rates.years ?? GRAPH_CASHFLOW_LONG_TERM_PREDICTION_YEARS)
        .fill(0)
        .reduce<OverviewGraphDate[]>(
          (last, _, index) => [
            ...last,
            {
              date: endOfYear(addYears(longTermStartDate, index)),
              monthIndex: initialMonthIndex + index * 12,
            },
          ],
          presentGraphDates,
        );
    }),
  { maxSize: 1 },
);
