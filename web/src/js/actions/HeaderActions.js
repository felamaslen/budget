/**
 * Actions called by the header (application-wide functions)
 */

import buildMessage from '../messageBuilder';
import {
  AC_USER_LOGGED_OUT
} from '../constants/actions';

export const aUserLoggedOut = () => buildMessage(AC_USER_LOGGED_OUT);

