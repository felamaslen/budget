import { createSelector } from 'reselect';
import { IncludeOne } from '~/types/utils';
import { GlobalState } from '~/reducers';

export type State = IncludeOne<GlobalState, 'login'>;

export const getToken = (state: State): string | undefined => state.login.token;

export const getLoggedIn = createSelector<State, string | undefined, boolean>(getToken, Boolean);
