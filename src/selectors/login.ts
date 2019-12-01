import { createSelector } from 'reselect';
import { GlobalState } from '~/reducers';

export const getToken = (state: GlobalState) => state.login.token;

export const getLoggedIn = createSelector<GlobalState, string | undefined, boolean>(
  getToken,
  Boolean,
);
