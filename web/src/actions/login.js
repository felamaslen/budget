import * as actions from '~client/constants/actions/login';

export const loginRequested = (pin) => ({ type: actions.LOGIN_REQUESTED, pin });

export const loginErrorOccurred = (err) => ({ type: actions.LOGIN_ERROR_OCCURRED, err });

export const loggedIn = (res) => ({ type: actions.LOGGED_IN, res });

export const loggedOut = () => ({ type: actions.LOGGED_OUT });
