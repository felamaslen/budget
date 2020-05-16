import { createSelector } from 'reselect';

import { getCrudRequests } from '~client/selectors/list';
import { getNetWorthRequests } from '~client/selectors/overview/net-worth';
import { State } from '~client/reducers';

export const getApiKey = (state: State): string | null => state.api.key;

export const getLocked = (state: State): boolean => state.api.locked;

export const getUnsaved = createSelector(getCrudRequests, getNetWorthRequests, (...args) =>
  args.some(requests => requests.length > 0),
);
