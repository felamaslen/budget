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

import { aErrorOpened } from '../actions/ErrorActions';
import { aLoginFormSubmitted, aLoginFormResponseGot } from '../actions/LoginActions';

import { updateServerData } from '../effects/app.effects';
import { getLoginCredentials, saveLoginCredentials } from '../effects/login.effects';

export const aUserLoggedOut = () => {
    return dispatch => {
        saveLoginCredentials(null);

        dispatch(buildMessage(USER_LOGGED_OUT));
    };
};

export const aSettingsLoaded = () => {
    return async dispatch => {
        if (!localStorage || !localStorage.getItem) {
            console.warn('localStorage not available - settings not saved');

            return;
        }

        const pin = await getLoginCredentials();

        if (pin) {
            dispatch(aLoginFormSubmitted(pin));
        }
        else {
            dispatch(aLoginFormResponseGot(null));
        }
    };
};

export const aPageNavigatedTo = page => buildMessage(PAGE_NAVIGATED, page);

export const aKeyPressed = key => buildMessage(KEY_PRESSED, key);

export const aTimeUpdated = () => buildMessage(TIME_UPDATED);

export const aServerUpdated = (apiKey, requestListWithIndex) => {
    return async dispatch => {
        dispatch(buildMessage(SERVER_UPDATED));

        const requestList = requestListWithIndex.map(item => item.get('req'));

        console.log('aServerUpdated with', requestList.size, 'requests');

        if (requestList.size > 0) {
            try {
                await updateServerData({ apiKey, requestList });
            }
            catch (err) {
                dispatch(aErrorOpened('Error updating data on server!'));
            }
        }

        dispatch(buildMessage(SERVER_UPDATE_RECEIVED));
    };
};

export const aServerAddReceived = response => buildMessage(SERVER_ADD_RECEIVED, response);

