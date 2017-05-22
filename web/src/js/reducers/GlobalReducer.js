/**
 * This is run whenever an action is called by a view, and decides which
 * reducer to run based on the action given.
 */

import {
  FORM_NEXT_CLICKED,
  FORM_RESPONSE_GOT,
  FORM_INPUT_CHANGED,
  FORM_RESET_CLICKED
} from '../constants/actions';

import {
  formNextStep,
  formHandleResponse,
  formUpdateValues,
  formReset
} from './FormReducer';

export default (reduction, action) => {
  switch (action.type) {
  case FORM_NEXT_CLICKED:
    return formNextStep(reduction, action.payload);
  case FORM_RESPONSE_GOT:
    return formHandleResponse(reduction, action.payload);
  case FORM_INPUT_CHANGED:
    return formUpdateValues(reduction, action.payload);
  case FORM_RESET_CLICKED:
    return formReset(reduction);

  default:
    // By default, the reduction is simply returned unchanged.
    return reduction;
  }
}

