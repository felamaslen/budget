/**
 * Actions called by the LoginForm component
 */

import buildMessage from '../messageBuilder';
import {
    AC_LOGIN_FORM_INPUTTED,
    AC_LOGIN_FORM_RESET,
    AC_LOGIN_FORM_SUBMITTED,
    AC_LOGIN_FORM_RESPONSE_GOT
} from '../constants/actions';

export const aLoginFormInputted = input => buildMessage(AC_LOGIN_FORM_INPUTTED, input);
export const aLoginFormReset = index => buildMessage(AC_LOGIN_FORM_RESET, index);
export const aLoginFormSubmitted = () => buildMessage(AC_LOGIN_FORM_SUBMITTED);
export const aLoginFormResponseGot = response => buildMessage(AC_LOGIN_FORM_RESPONSE_GOT, response);

