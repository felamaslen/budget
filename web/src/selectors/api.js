import { createSelector } from 'reselect';

import { getCrudRequests } from '~client/selectors/list';
import { getNetWorthRequests } from '~client/selectors/overview/net-worth';

export const getApiKey = state => state.api.key;

export const getLocked = state => Boolean(state.api.locked);

export const getUnsaved = createSelector(
    getCrudRequests,
    getNetWorthRequests,
    (...args) => args.some(requests => requests.length > 0)
);
