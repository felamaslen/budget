/**
 * This is run whenever an action is called by a view, and decides which
 * reducer to run based on the action given.
 */

import {
  AC_LOGIN_FORM_INPUTTED,
  AC_LOGIN_FORM_RESET,
  AC_LOGIN_FORM_SUBMITTED,
  AC_LOGIN_FORM_RESPONSE_GOT,

  AC_USER_LOGGED_OUT
} from '../constants/actions';

import {
  rLoginFormInput,
  rLoginFormReset,
  rLoginFormSubmit,
  rLoginFormHandleResponse
} from './LoginFormReducer';
import {
  rLogout
} from './HeaderReducer';

export default (reduction, action) => {
  switch (action.type) {
  case AC_LOGIN_FORM_INPUTTED:
    return rLoginFormInput(reduction, action.payload);
  case AC_LOGIN_FORM_RESET:
    return rLoginFormReset(reduction, action.payload);
  case AC_LOGIN_FORM_SUBMITTED:
    return rLoginFormSubmit(reduction);
  case AC_LOGIN_FORM_RESPONSE_GOT:
    return rLoginFormHandleResponse(reduction, action.payload);

  case AC_USER_LOGGED_OUT:
    return rLogout(reduction);

  default:
    // By default, the reduction is simply returned unchanged.
    return reduction;
  }
};

