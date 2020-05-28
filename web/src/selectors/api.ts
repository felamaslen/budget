import { createSelector } from 'reselect';

import { State } from '~client/reducers';
import { getCrudRequests } from '~client/selectors/list';
import { getNetWorthRequests } from '~client/selectors/overview/net-worth';

export const getApiKey = (state: State): string | null => state.api.key;
export const getLocked = (state: State): boolean => state.api.locked;
export const getApiLoading = (state: State): boolean => state.api.loading;
export const getInitialLoading = (state: State): boolean => state.api.initialLoading;

export const getUnsaved = createSelector(getCrudRequests, getNetWorthRequests, (...args) =>
  args.some((requests) => requests.length > 0),
);
