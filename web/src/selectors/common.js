import { createSelector } from 'reselect';

import { getCurrentDate } from '~client/selectors/now';
import { getMonthDiff, getMonthDatesList } from '~client/modules/date';

export const getStartDate = state => state.overview.startDate;
export const getEndDate = state => state.overview.endDate;

export const getNumMonths = createSelector(getStartDate, getEndDate,
    (startDate, endDate) => getMonthDiff(startDate, endDate) + 1);

export const getFutureMonths = createSelector(getCurrentDate, getEndDate,
    (startDate, endDate) => getMonthDiff(startDate, endDate) - 1);

export const getMonthDates = createSelector(getStartDate, getEndDate, getMonthDatesList);
