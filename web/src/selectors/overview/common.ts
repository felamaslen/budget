import differenceInMonths from 'date-fns/differenceInMonths';
import endOfMonth from 'date-fns/endOfMonth';
import isSameDay from 'date-fns/isSameDay';
import moize from 'moize';
import { createSelector } from 'reselect';

import { GRAPH_SPEND_CATEGORIES } from '~client/constants/graph';
import { getMonthDatesList, inclusiveMonthDifference } from '~client/modules/date';
import type { State } from '~client/reducers/types';
import type { PageNonStandard, CostProcessed } from '~client/types';
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
