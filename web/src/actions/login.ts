import { LoginResponse } from '~client/types';

export const enum ActionTypeLogin {
  Requested = '@@login/REQUESTED',
  ErrorOccurred = '@@login/ERROR_OCCURRED',
  LoggedIn = '@@login/LOGGED_IN',
  LoggedOut = '@@login/LOGGED_OUT',
}

export type ActionLoginRequested = {
  type: ActionTypeLogin.Requested;
  pin: number;
};

export const loginRequested = (pin: number): ActionLoginRequested => ({
  type: ActionTypeLogin.Requested,
  pin,
});

export type ActionLoginErrorOccurred = {
  type: ActionTypeLogin.ErrorOccurred;
  error: string;
};

export const loginErrorOccurred = (error: string): ActionLoginErrorOccurred => ({
  type: ActionTypeLogin.ErrorOccurred,
  error,
});

export type ActionLoggedIn = {
  type: ActionTypeLogin.LoggedIn;
  res: LoginResponse;
};

export const loggedIn = (res: LoginResponse): ActionLoggedIn => ({
  type: ActionTypeLogin.LoggedIn,
  res,
});

export type ActionLoggedOut = {
  type: ActionTypeLogin.LoggedOut;
};

export const loggedOut = (): ActionLoggedOut => ({ type: ActionTypeLogin.LoggedOut });

export type ActionLogin =
  | ActionLoginRequested
  | ActionLoginErrorOccurred
  | ActionLoggedIn
  | ActionLoggedOut;
