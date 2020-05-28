import { Action } from 'create-reducer-object';
import * as actions from '~client/constants/actions/login';
import { LoginResponse } from '~client/types/auth';

export const loginRequested = (pin: number): Action => ({ type: actions.LOGIN_REQUESTED, pin });

export const loginErrorOccurred = (err: Error): Action => ({
  type: actions.LOGIN_ERROR_OCCURRED,
  err,
});

export const loggedIn = (res: LoginResponse): Action => ({ type: actions.LOGGED_IN, res });

export const loggedOut = (): { type: string } => ({ type: actions.LOGGED_OUT });
