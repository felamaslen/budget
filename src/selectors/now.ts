import { createSelector } from 'reselect';
import endOfDay from 'date-fns/endOfDay';

import { IncludeOne } from '~/types/utils';
import { GlobalState } from '~/reducers';

export type State = IncludeOne<GlobalState, 'now'>;

export const getNow = (state: State): Date => state.now;

const getEndOfDayTimestamp = createSelector(getNow, (now: Date): number => endOfDay(now).getTime());

export const getCurrentDate = createSelector(
  getEndOfDayTimestamp,
  (timestamp: number): Date => new Date(timestamp),
);
