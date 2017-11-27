/**
 * Actions called by the header (application-wide functions)
 */

import buildMessage from '../messageBuilder';
import {
    SETTINGS_LOADED,
    USER_LOGGED_OUT,
    KEY_PRESSED,
    TIME_UPDATED,
    SERVER_UPDATED,
    SERVER_UPDATE_RECEIVED,
    SERVER_ADD_RECEIVED
} from '../constants/actions';

export const aSettingsLoaded = () => buildMessage(SETTINGS_LOADED);
export const aUserLoggedOut = () => buildMessage(USER_LOGGED_OUT);
export const aKeyPressed = key => buildMessage(KEY_PRESSED, key);
export const aTimeUpdated = () => buildMessage(TIME_UPDATED);
export const aServerUpdated = () => buildMessage(SERVER_UPDATED);
export const aServerUpdateReceived = res => buildMessage(SERVER_UPDATE_RECEIVED, res);
export const aServerAddReceived = res => buildMessage(SERVER_ADD_RECEIVED, res);

