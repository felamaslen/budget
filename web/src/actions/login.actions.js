/**
 * Actions called by the LoginForm component
 */

import * as A from '../constants/actions';

export const aLoginFormInputted = input => ({ type: A.LOGIN_FORM_INPUTTED, input });
export const aLoginFormReset = index => ({ type: A.LOGIN_FORM_RESET, index });
export const aLoginFormSubmitted = pin => ({ type: A.LOGIN_FORM_SUBMITTED, pin });
export const aLoginFormResponseReceived = res => ({ type: A.LOGIN_FORM_RESPONSE_GOT, ...res });

