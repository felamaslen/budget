import { Action } from 'redux';
import isSameSecond from 'date-fns/isSameSecond';

import { TIME_UPDATED } from '~client/constants/actions/now';

export const initialState = new Date();

export default (state: Date = initialState, action: Action | null): Date => {
  if (!(action && action.type === TIME_UPDATED)) {
    return state;
  }

  const now = new Date();
  return isSameSecond(now, state) ? state : now;
};
