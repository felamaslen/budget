import { State } from '~client/reducers';
import { AppConfig } from '~client/types';

export const getAppConfig = (state: State): AppConfig => state.api.appConfig;
