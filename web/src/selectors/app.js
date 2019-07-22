import { createSelector } from 'reselect';

import { getApiKey } from '~client/selectors/api';

const getUid = state => state.login.uid;

export const getLoggedIn = createSelector(getApiKey, getUid, (apiKey, uid) => Boolean(apiKey && uid));
