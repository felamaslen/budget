import { createSelector } from 'reselect';
import addMonths from 'date-fns/addMonths';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import differenceInMonths from 'date-fns/differenceInMonths';

import { MonthCost, Summary } from '~/types/overview';
import { IncludeOne } from '~/types/utils';
import { GlobalState } from '~/reducers';

import { getCurrentDate } from '~/selectors/now';
import { getMonthDatesList } from '~/modules/date';

export type State = IncludeOne<GlobalState, 'now' | 'overview' | 'netWorth' | 'funds'>;

export const spendingCategories: (keyof MonthCost)[] = [
  'bills',
  'food',
  'general',
  'holiday',
  'social',
];

export const getOverviewNetWorth = (state: State): number[] => state.overview.netWorth;

export const getMonthCost = (state: State): MonthCost => ({
  income: state.overview.income,
  bills: state.overview.bills,
  food: state.overview.food,
  general: state.overview.general,
  holiday: state.overview.holiday,
  social: state.overview.social,
});

export const getSummary = (state: State): Summary => ({
  ...getMonthCost(state),
  netWorth: state.overview.netWorth,
  funds: state.overview.funds.map(({ value }) => value),
  fundCosts: state.overview.funds.map(({ cost }) => cost),
});

const getStartDateRaw = (state: State): Date => state.overview.startDate;
const getViewStartDateRaw = (state: State): Date => state.overview.viewStartDate;

export const getStartDate = createSelector<State, Date, Date>(getStartDateRaw, endOfMonth);
export const getViewStartDate = createSelector<State, Date, Date>(getViewStartDateRaw, endOfMonth);

export const getOldMonths = createSelector<State, Date, Date, number>(
  getStartDate,
  getViewStartDate,
  (startDate, viewStartDate): number => differenceInMonths(viewStartDate, startDate),
);

export const getPastMonths = createSelector<State, Date, Date, number>(
  getCurrentDate,
  getViewStartDate,
  (now, viewStartDate): number =>
    Math.max(0, differenceInMonths(endOfMonth(now), startOfMonth(viewStartDate))),
);
export const getFutureMonths = (state: State): number => state.overview.futureMonths;

export const getEndDate = createSelector<State, Date, Date, number, Date>(
  getCurrentDate,
  getViewStartDate,
  getFutureMonths,
  (now: Date, viewStartDate: Date, futureMonths: number): Date => {
    const nowPlusFuture = endOfMonth(addMonths(now, futureMonths));
    if (nowPlusFuture < viewStartDate) {
      return viewStartDate;
    }

    return nowPlusFuture;
  },
);

export const getNumMonths = createSelector<State, Date, Date, number>(
  getViewStartDate,
  getEndDate,
  (viewStartDate, endDate) =>
    Math.max(1, differenceInMonths(endDate, startOfMonth(viewStartDate)) + 1),
);

export const getMonthDates = createSelector<State, Date, Date, Date[]>(
  getViewStartDate,
  getEndDate,
  getMonthDatesList,
);
