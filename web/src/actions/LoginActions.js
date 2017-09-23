/**
 * Actions called by the LoginForm component
 */

import { Map as map } from 'immutable';

import { ERROR_LEVEL_ERROR } from '../misc/const';

import buildMessage from '../messageBuilder';
import {
    LOGIN_FORM_INPUTTED,
    LOGIN_FORM_RESET,
    LOGIN_FORM_SUBMITTED,
    LOGIN_FORM_RESPONSE_GOT
} from '../constants/actions';

import { aErrorOpened } from './ErrorActions';

import {
    saveLoginCredentials, submitLoginForm
} from '../effects/login.effects';

export const aLoginFormInputted = input => buildMessage(LOGIN_FORM_INPUTTED, input);

export const aLoginFormReset = index => buildMessage(LOGIN_FORM_RESET, index);

export const aLoginFormSubmitted = pin => {
    return async dispatch => {
        dispatch(buildMessage(LOGIN_FORM_SUBMITTED));

        try {
            const response = await submitLoginForm(pin);

            // logged in
            await saveLoginCredentials(pin);

            dispatch(buildMessage(LOGIN_FORM_RESPONSE_GOT, response));
        }
        catch (err) {
            if (err.response) {
                const message = map({
                    text: `Login error: ${err.response.data.errorMessage}`,
                    level: ERROR_LEVEL_ERROR
                });

                dispatch(aErrorOpened(message));
            }
            else {
                console.error(err);
                console.error(err.stack);
            }

            dispatch(buildMessage(LOGIN_FORM_RESPONSE_GOT, null));
        }
    };
};

