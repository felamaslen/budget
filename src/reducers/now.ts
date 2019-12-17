import { Action } from 'redux';
import isSameSecond from 'date-fns/isSameSecond';

import { TIME_UPDATED } from '~/constants/actions.app';

export const initialState: Date = new Date();

export default (state = initialState, action: Action): Date => {
  if (!(action && action.type === TIME_UPDATED)) {
    return state;
  }

  const now = new Date();

  if (isSameSecond(now, state)) {
    return state;
  }

  return now;
};
