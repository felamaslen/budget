/**
 * Actions called by the header (application-wide functions)
 */

import buildMessage from '../messageBuilder';
import {
  AC_USER_LOGGED_OUT,
  AC_COOKIES_LOADED,
  AC_PAGE_NAVIGATED
} from '../constants/actions';

export const aUserLoggedOut = () => buildMessage(AC_USER_LOGGED_OUT);
export const aCookiesLoaded = () => buildMessage(AC_COOKIES_LOADED);
export const aPageNavigatedTo = page => buildMessage(AC_PAGE_NAVIGATED, page);

