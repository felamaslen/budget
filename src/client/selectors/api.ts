import { PAGES_LIST } from '~client/constants/data';
import type { State } from '~client/reducers';
import type { LocalAppConfig } from '~client/types';

export const getApiLoading = (state: State): boolean =>
  state.api.loading > 0 || PAGES_LIST.some((page) => state[page].__optimistic.some(Boolean));

export const getAppConfig = (state: State): LocalAppConfig => state.api.appConfig;
export const getAppConfigSerial = (state: State): number => state.api.appConfigSerial;
