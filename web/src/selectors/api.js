import { createSelector } from 'reselect';

import { getCrudRequests } from '~client/selectors/list';

export const getApiKey = state => state.api.key;

export const getLocked = state => Boolean(state.api.locked);

export const getUnsaved = createSelector(getCrudRequests, requests => requests.length > 0);
