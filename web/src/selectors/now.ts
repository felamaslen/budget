import endOfDay from 'date-fns/endOfDay';
import memoize from 'memoize-one';
import { createSelector } from 'reselect';

import { State } from '~client/reducers/types';

export const getNow = (state: State): Date => state.now;

const getEndOfDayTimestamp = createSelector(getNow, (now) => endOfDay(now).getTime());
const memoisedDate = memoize((timestamp: number): Date => new Date(timestamp));

export const getCurrentDate = createSelector<State, number, Date>(
  getEndOfDayTimestamp,
  memoisedDate,
);
