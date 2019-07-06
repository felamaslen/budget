import { createSelector } from 'reselect';

import { getApiKey } from '~client/selectors/api';

export const getNow = state => state.now;

const getUid = state => state.login.user.uid;

export const getLoggedIn = createSelector(getApiKey, getUid, (apiKey, uid) => Boolean(apiKey && uid));
