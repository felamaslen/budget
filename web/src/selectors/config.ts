import { State } from '~client/reducers';

export const getAppConfig = (state: State): State['api']['appConfig'] => state.api.appConfig;
