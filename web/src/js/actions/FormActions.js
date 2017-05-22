/**
 * Defines actions for use by the Form component
 */

import buildMessage from '../messageBuilder';

import {
  FORM_NEXT_CLICKED,
  FORM_RESPONSE_GOT,
  FORM_INPUT_CHANGED,
  FORM_RESET_CLICKED
} from '../constants/actions';

export const formNextClicked = form => buildMessage(FORM_NEXT_CLICKED, form);
export const formResponseGot = response => buildMessage(FORM_RESPONSE_GOT, response);
export const formInputChanged = input => buildMessage(FORM_INPUT_CHANGED, input);
export const formResetClicked = () => buildMessage(FORM_RESET_CLICKED);

