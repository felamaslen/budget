import { ERRORED } from '~/constants/actions.rt';
import { LOGIN_REQUESTED, LOGGED_IN, LOGGED_OUT } from '~/constants/actions.app';
import { ErrorAction } from '~/actions/types';
import { LoggedInAction, LoginActions } from '~/actions/login';

export interface LoginState {
  loading: boolean;
  error?: string;
  uid?: string;
  name?: string;
  token?: string;
}

export const initialState: LoginState = {
  loading: false,
};

const onLoginRequest = (): LoginState => ({
  loading: true,
});

function onLogin(state: LoginState, action: LoggedInAction): LoginState {
  return {
    loading: false,
    ...action.payload,
  };
}

const onLoginError = (state: LoginState, action: ErrorAction<typeof LOGGED_IN>): LoginState => ({
  loading: false,
  error: action.payload.error,
});

const onLogout = (): LoginState => ({
  loading: false,
});

export default function loginReducer(state = initialState, action: LoginActions): LoginState {
  switch (action.type) {
    case LOGIN_REQUESTED:
      return onLoginRequest();
    case LOGGED_IN:
      return onLogin(state, action);
    case ERRORED:
      return onLoginError(state, action);
    case LOGGED_OUT:
      return onLogout();
    default:
      return state;
  }
}
