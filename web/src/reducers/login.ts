import { ActionTypeLogin, Action } from '~client/actions';

export type State = {
  initialised: boolean;
  loading: boolean;
  error: string | null;
  uid: string | null;
  name: string | null;
};

export const initialState: State = {
  initialised: false,
  loading: false,
  error: null,
  uid: null,
  name: null,
};

export default function login(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeLogin.Requested:
      return { ...state, loading: true };
    case ActionTypeLogin.ErrorOccurred:
      return { ...state, initialised: true, loading: false, error: action.error };
    case ActionTypeLogin.LoggedIn:
      return {
        ...state,
        initialised: true,
        loading: false,
        error: null,
        uid: action.res.uid,
        name: action.res.name,
      };
    case ActionTypeLogin.LoggedOut:
      return { ...initialState, initialised: true };
    default:
      return state;
  }
}
