import { createSelector } from 'reselect';
import { DateTime } from 'luxon';

export const getNow = state => state.now;

const getEndOfDayTimestamp = createSelector(getNow, now => now.endOf('day').ts);

export const getCurrentDate = createSelector(getEndOfDayTimestamp, ts => DateTime.fromMillis(ts));
