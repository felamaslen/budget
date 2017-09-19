/**
 * Actions called by the header (application-wide functions)
 */

import buildMessage from '../messageBuilder';
import {
    USER_LOGGED_OUT,
    COOKIES_LOADED,
    PAGE_NAVIGATED,
    KEY_PRESSED,
    SERVER_UPDATED,
    SERVER_UPDATE_RECEIVED,
    SERVER_ADD_RECEIVED
} from '../constants/actions';

export const aUserLoggedOut = () => buildMessage(USER_LOGGED_OUT);
export const aCookiesLoaded = () => buildMessage(COOKIES_LOADED);
export const aPageNavigatedTo = page => buildMessage(PAGE_NAVIGATED, page);
export const aKeyPressed = key => buildMessage(KEY_PRESSED, key);
export const aServerUpdated = () => buildMessage(SERVER_UPDATED);
export const aServerUpdateReceived = response => buildMessage(SERVER_UPDATE_RECEIVED, response);
export const aServerAddReceived = response => buildMessage(SERVER_ADD_RECEIVED, response);

