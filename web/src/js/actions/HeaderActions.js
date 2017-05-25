/**
 * Actions called by the header (application-wide functions)
 */

import buildMessage from '../messageBuilder';
import {
  AC_USER_LOGGED_OUT,
  AC_USER_COOKIE_CHECKED
} from '../constants/actions';

export const aUserLoggedOut = () => buildMessage(AC_USER_LOGGED_OUT);
export const aUserCookieChecked = () => buildMessage(AC_USER_COOKIE_CHECKED);

