import { createSelector } from 'reselect';

import { getCurrentDate } from '~client/selectors/now';
import { getMonthDiff, getMonthDatesList } from '~client/modules/date';

import { GRAPH_SPEND_CATEGORIES } from '~client/constants/graph';

export const getCost = state => state.overview.cost;

const spendingCategories = GRAPH_SPEND_CATEGORIES.map(({ name }) => name);

export const getSpendingColumn = dates => data => ({
    ...data,
    spending: dates.map((date, index) =>
        spendingCategories.reduce((sum, category) => sum + data[category][index], 0)
    )
});

export const getStartDate = state => state.overview.startDate;
export const getEndDate = state => state.overview.endDate;

export const getNumMonths = createSelector(getStartDate, getEndDate,
    (startDate, endDate) => getMonthDiff(startDate, endDate) + 1);

export const getFutureMonths = createSelector(getCurrentDate, getEndDate, (currentDate, endDate) =>
    getMonthDiff(currentDate, endDate));

export const getMonthDates = createSelector(getStartDate, getEndDate, getMonthDatesList);
