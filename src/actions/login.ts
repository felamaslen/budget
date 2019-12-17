import { LOGIN_REQUESTED, LOGGED_IN, LOGGED_OUT } from '~/constants/actions.app';
import { ErrorAction } from '~/types/actions';

export interface LoginResponsePayload {
  uid: string;
  name: string;
  token: string;
}

export interface LoginRequestAction {
  type: typeof LOGIN_REQUESTED;
  pin: string;
}

export interface LoggedInAction {
  type: typeof LOGGED_IN;
  payload: LoginResponsePayload;
}

export interface LoggedOutAction {
  type: typeof LOGGED_OUT;
}

export const loginRequested = (pin: string): LoginRequestAction => ({
  type: LOGIN_REQUESTED,
  pin,
});

export const loggedIn = (payload: LoginResponsePayload): LoggedInAction => ({
  type: LOGGED_IN,
  payload,
});

export const loggedOut = (): LoggedOutAction => ({
  type: LOGGED_OUT,
});

export type LoginAction = LoginRequestAction | LoggedInAction | LoggedOutAction | ErrorAction;
