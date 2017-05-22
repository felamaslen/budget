/**
 * Handles calls from view(s), in turn calling on the dispatcher's global
 * reducer to modify the store
 */

import buildMessage from '../messageBuilder';
import {
  AC_USER_LOGGED_OUT
} from '../constants/actions';

export const aUserLoggedOut = () => buildMessage(AC_USER_LOGGED_OUT);

