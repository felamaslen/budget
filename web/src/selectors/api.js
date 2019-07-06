import { createSelector } from 'reselect';

import { getCrudRequests } from '~client/selectors/list';

export const getApiKey = state => state.api.key;

export const getUnsaved = createSelector(getCrudRequests, requests => requests.length > 0);
