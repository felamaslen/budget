import { createSelector } from 'reselect';

import { getApiKey } from './api';
import { State } from '~client/reducers';

const getUid = (state: State): string | null => state.login.uid;

export const getLoggedIn = createSelector(getApiKey, getUid, (apiKey, uid) =>
  Boolean(apiKey && uid),
);

export const getInitialised = (state: State): boolean => state.login.initialised;
export const loginLoading = (state: State): boolean => state.login.loading;
