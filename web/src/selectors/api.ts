import { PAGES_LIST } from '~client/constants/data';
import { State } from '~client/reducers';

export const getApiLoading = (state: State): boolean =>
  state.api.loading > 0 || PAGES_LIST.some((page) => state[page].__optimistic.some(Boolean));
