import { createSelector } from 'reselect';
import { LoginState } from '~/reducers/login';

export interface LoginSlice {
  login: LoginState;
}

export const getToken = (state: LoginSlice): string | undefined => state.login.token;

export const getLoggedIn = createSelector<LoginSlice, string | undefined, boolean>(
  getToken,
  Boolean,
);
