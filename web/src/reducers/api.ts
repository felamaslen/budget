import { Action, ActionTypeApi, ActionTypeLogin, ActionApiDataRead } from '~client/actions';
import { AppConfig } from '~client/types';

export type State = {
  loading: boolean;
  initialLoading: boolean;
  dataLoaded: boolean; // TODO: remove this hack when converting all to GQL
  locked: boolean;
  error: Error | null;
  key: string | null;
  appConfig: AppConfig;
};

export const initialState: State = {
  loading: false,
  initialLoading: true,
  dataLoaded: false,
  locked: false,
  error: null,
  key: null,
  appConfig: {
    birthDate: new Date('1990-01-01'),
  },
};

const onDataRead = (state: State, action: ActionApiDataRead): State => ({
  ...state,
  initialLoading: false,
  dataLoaded: true,
  appConfig: {
    birthDate: new Date(action.res.appConfig.birthDate),
  },
});

export default function api(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeApi.DataRead:
      return onDataRead(state, action);
    case ActionTypeApi.SyncRequested:
      return { ...state, loading: true };
    case ActionTypeApi.SyncLocked:
      return { ...state, locked: true };
    case ActionTypeApi.SyncUnlocked:
      return { ...state, locked: false };
    case ActionTypeApi.SyncReceived:
      return { ...state, loading: false, error: null };
    case ActionTypeApi.SyncErrorOccurred:
      return {
        ...state,
        error: action.err,
        loading: false,
      };

    case ActionTypeLogin.ApiKeySet:
      return { ...initialState, key: action.apiKey };
    case ActionTypeLogin.LoggedOut:
      return { ...initialState, initialLoading: false, dataLoaded: false };

    default:
      return state;
  }
}
