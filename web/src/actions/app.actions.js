/**
 * Actions called by the header (application-wide functions)
 */

import * as A from '~client/constants/actions';

export const aWindowResized = size => ({ type: A.WINDOW_RESIZED, size });
export const aSettingsLoaded = () => ({ type: A.SETTINGS_LOADED });
export const aUserLoggedOut = () => ({ type: A.USER_LOGGED_OUT });
export const aKeyPressed = req => ({ type: A.KEY_PRESSED, ...req });
export const aTimeUpdated = now => ({ type: A.TIME_UPDATED, now });
export const aServerUpdated = () => ({ type: A.SERVER_UPDATED });
export const aServerUpdateReceived = res => ({ type: A.SERVER_UPDATE_RECEIVED, ...res });
export const aServerAddReceived = res => ({ type: A.SERVER_ADD_RECEIVED, ...res });

