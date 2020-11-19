import { Action, ActionTypeApi, ActionTypeLogin, ActionApiDataRead } from '~client/actions';
import { AppConfig } from '~client/types';

export type State = {
  loading: boolean;
  initialLoading: boolean;
  locked: boolean;
  error: Error | null;
  key: string | null;
  appConfig: AppConfig;
};

export const initialState: State = {
  loading: false,
  initialLoading: false,
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

    case ActionTypeLogin.LoggedIn:
      return { ...state, key: action.res.apiKey, initialLoading: true };
    case ActionTypeLogin.LoggedOut:
      return initialState;

    default:
      return state;
  }
}
