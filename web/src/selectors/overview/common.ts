import { createSelector } from 'reselect';
import differenceInMonths from 'date-fns/differenceInMonths';

import { State } from '~client/reducers/types';
import { Cost, CostProcessed } from '~client/types/overview';
import { getCurrentDate } from '~client/selectors/now';
import { getMonthDatesList } from '~client/modules/date';
import { GRAPH_SPEND_CATEGORIES } from '~client/constants/graph';
import { Page } from '~client/types/app';

export const getCost = (state: State): Cost => state.overview.cost;

const spendingCategories = GRAPH_SPEND_CATEGORIES.map(({ name }) => name);

export const getSpendingColumn = <K extends keyof CostProcessed = never>(dates: Date[]) => (
  data: Cost & Pick<CostProcessed, K>,
): Cost & Pick<CostProcessed, K | 'spending'> => ({
  ...data,
  spending: dates.map((_: Date, index) =>
    spendingCategories.reduce((sum, category) => sum + (data[category]?.[index] ?? 0), 0),
  ),
});

export const getStartDate = (state: Pick<State, Page.overview>): Date => state.overview.startDate;
export const getEndDate = (state: Pick<State, Page.overview>): Date => state.overview.endDate;

export const getNumMonths = createSelector(
  getStartDate,
  getEndDate,
  (startDate, endDate) => differenceInMonths(endDate, startDate) + 1,
);

export const getFutureMonths = createSelector(getCurrentDate, getEndDate, (currentDate, endDate) =>
  differenceInMonths(endDate, currentDate),
);

export const getMonthDates = createSelector(getStartDate, getEndDate, getMonthDatesList);
