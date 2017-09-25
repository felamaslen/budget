/**
 * Actions called by the header (application-wide functions)
 */

import buildMessage from '../messageBuilder';
import {
    USER_LOGGED_OUT,
    PAGE_NAVIGATED,
    KEY_PRESSED,
    TIME_UPDATED,
    SERVER_UPDATED,
    SERVER_UPDATE_RECEIVED,
    SERVER_ADD_RECEIVED
} from '../constants/actions';

import {
    LOCAL_SETTINGS_REQUESTED, SERVER_UPDATE_REQUESTED
} from '../constants/effects';

export const aSettingsLoaded = () => buildMessage(LOCAL_SETTINGS_REQUESTED, null, LOCAL_SETTINGS_REQUESTED);
export const aUserLoggedOut = () => buildMessage(USER_LOGGED_OUT);
export const aPageNavigatedTo = page => buildMessage(PAGE_NAVIGATED, page);
export const aKeyPressed = key => buildMessage(KEY_PRESSED, key);
export const aTimeUpdated = () => buildMessage(TIME_UPDATED);
export const aServerUpdated = () => buildMessage(SERVER_UPDATED, null, SERVER_UPDATE_REQUESTED);
export const aServerUpdateReceived = res => buildMessage(SERVER_UPDATE_RECEIVED, res);
export const aServerAddReceived = response => buildMessage(SERVER_ADD_RECEIVED, response);

