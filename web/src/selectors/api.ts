import { State } from '~client/reducers';

export const getApiLoading = (state: State): boolean => state.api.loading;
