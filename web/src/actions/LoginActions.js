/**
 * Actions called by the LoginForm component
 */

import buildMessage from '../messageBuilder';
import {
    LOGIN_FORM_INPUTTED,
    LOGIN_FORM_RESET,
    LOGIN_FORM_SUBMITTED,
    LOGIN_FORM_RESPONSE_GOT
} from '../constants/actions';

export const aLoginFormInputted = input => buildMessage(LOGIN_FORM_INPUTTED, input);
export const aLoginFormReset = index => buildMessage(LOGIN_FORM_RESET, index);
export const aLoginFormSubmitted = () => buildMessage(LOGIN_FORM_SUBMITTED);
export const aLoginFormResponseGot = response => buildMessage(LOGIN_FORM_RESPONSE_GOT, response);

