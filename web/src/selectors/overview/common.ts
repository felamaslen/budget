import { createSelector } from 'reselect';
import { DateTime } from 'luxon';

import { State } from '~client/reducers/types';
import { Cost, CostProcessed } from '~client/types/overview';
import { getCurrentDate } from '~client/selectors/now';
import { getMonthDiff, getMonthDatesList } from '~client/modules/date';
import { GRAPH_SPEND_CATEGORIES } from '~client/constants/graph';
import { Page } from '~client/types/app';

export const getCost = (state: State): Cost => state.overview.cost;

const spendingCategories = GRAPH_SPEND_CATEGORIES.map(({ name }) => name);

export const getSpendingColumn = <K extends keyof CostProcessed = never>(dates: DateTime[]) => (
  data: Cost & Pick<CostProcessed, K>,
): Cost & Pick<CostProcessed, K | 'spending'> => ({
  ...data,
  spending: dates.map((_: DateTime, index) =>
    spendingCategories.reduce((sum, category) => sum + (data[category]?.[index] ?? 0), 0),
  ),
});

export const getStartDate = (state: Pick<State, Page.overview>): DateTime =>
  state.overview.startDate;
export const getEndDate = (state: Pick<State, Page.overview>): DateTime => state.overview.endDate;

export const getNumMonths = createSelector(
  getStartDate,
  getEndDate,
  (startDate, endDate) => getMonthDiff(startDate, endDate) + 1,
);

export const getFutureMonths = createSelector(getCurrentDate, getEndDate, (currentDate, endDate) =>
  getMonthDiff(currentDate, endDate),
);

export const getMonthDates = createSelector(getStartDate, getEndDate, getMonthDatesList);
