import { Action, ActionTypeApi, ActionTypeLogin } from '~client/actions';

export type State = {
  loading: boolean;
  initialLoading: boolean;
  locked: boolean;
  error: Error | null;
  key: string | null;
};

export const initialState: State = {
  loading: false,
  initialLoading: false,
  locked: false,
  error: null,
  key: null,
};

export default function api(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeApi.DataRead:
      return { ...state, initialLoading: false };
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
