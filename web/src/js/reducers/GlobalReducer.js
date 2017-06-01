/**
 * This is run whenever an action is called by a view, and decides which
 * reducer to run based on the action given.
 */

import {
  AC_ERROR_OPEN,
  AC_ERROR_CLOSE,
  AC_ERROR_REMOVE,

  AC_LOGIN_FORM_INPUTTED,
  AC_LOGIN_FORM_RESET,
  AC_LOGIN_FORM_SUBMITTED,
  AC_LOGIN_FORM_RESPONSE_GOT,

  AC_USER_LOGGED_OUT,
  AC_COOKIES_LOADED,
  AC_PAGE_NAVIGATED,
  AC_KEY_PRESSED,

  AC_CONTENT_LOADED,

  AC_EDIT_ACTIVATED,
  AC_EDIT_CHANGED
} from '../constants/actions';

import {
  rErrorMessageOpen,
  rErrorMessageClose,
  rErrorMessageRemove
} from './ErrorReducer';
import {
  rLoginFormInput,
  rLoginFormReset,
  rLoginFormSubmit,
  rLoginFormHandleResponse
} from './LoginFormReducer';
import {
  rLogout,
  rLoadCookies,
  rNavigateToPage,
  rHandleKeyPress
} from './HeaderReducer';
import {
  rHandleContentResponse
} from './ContentReducer';
import {
  rActivateEditable,
  rChangeEditable
} from './EditReducer';

export default (reduction, action) => {
  switch (action.type) {
  // error message actions
  case AC_ERROR_OPEN:
    return rErrorMessageOpen(reduction, action.payload);
  case AC_ERROR_CLOSE:
    return rErrorMessageClose(reduction, action.payload);
  case AC_ERROR_REMOVE:
    return rErrorMessageRemove(reduction, action.payload);

  // login form actions
  case AC_LOGIN_FORM_INPUTTED:
    return rLoginFormInput(reduction, action.payload);
  case AC_LOGIN_FORM_RESET:
    return rLoginFormReset(reduction, action.payload);
  case AC_LOGIN_FORM_SUBMITTED:
    return rLoginFormSubmit(reduction);
  case AC_LOGIN_FORM_RESPONSE_GOT:
    return rLoginFormHandleResponse(reduction, action.payload);

  // header / app actions
  case AC_USER_LOGGED_OUT:
    return rLogout(reduction);
  case AC_COOKIES_LOADED:
    return rLoadCookies(reduction);
  case AC_PAGE_NAVIGATED:
    return rNavigateToPage(reduction, action.payload);
  case AC_KEY_PRESSED:
    return rHandleKeyPress(reduction, action.payload);

  // content actions
  case AC_CONTENT_LOADED:
    return rHandleContentResponse(reduction, action.payload);

  // editable actions
  case AC_EDIT_ACTIVATED:
    return rActivateEditable(reduction, action.payload);
  case AC_EDIT_CHANGED:
    return rChangeEditable(reduction, action.payload);

  default:
    // By default, the reduction is simply returned unchanged.
    return reduction;
  }
};

