/**
 * Actions called by the header (application-wide functions)
 */

import buildMessage from '../messageBuilder';
import {
  AC_USER_LOGGED_OUT,
  AC_COOKIES_LOADED,
  AC_PAGE_NAVIGATED,
  AC_KEY_PRESSED,
  AC_SERVER_UPDATED,
  AC_SERVER_UPDATE_RECEIVED,
  AC_SERVER_ADD_RECEIVED
} from '../constants/actions';

export const aUserLoggedOut = () => buildMessage(AC_USER_LOGGED_OUT);
export const aCookiesLoaded = () => buildMessage(AC_COOKIES_LOADED);
export const aPageNavigatedTo = page => buildMessage(AC_PAGE_NAVIGATED, page);
export const aKeyPressed = key => buildMessage(AC_KEY_PRESSED, key);
export const aServerUpdated = () => buildMessage(AC_SERVER_UPDATED);
export const aServerUpdateReceived = response => buildMessage(AC_SERVER_UPDATE_RECEIVED, response);
export const aServerAddReceived = response => buildMessage(AC_SERVER_ADD_RECEIVED, response);

