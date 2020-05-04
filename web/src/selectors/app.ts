import { createSelector } from 'reselect';

import { getApiKey } from '~client/selectors/api';
import { State } from '~client/reducers';

const getUid = (state: State): string | null => state.login.uid;

export const getLoggedIn = createSelector(getApiKey, getUid, (apiKey, uid) =>
  Boolean(apiKey && uid),
);

export const getWindowWidth = (state: State): number => state.app.windowWidth;
