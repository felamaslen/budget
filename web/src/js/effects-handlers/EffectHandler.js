/**
 * Define side effects here (e.g. API calls)
 */

import { } from 'immutable';
import axios from 'axios';

import buildEffectHandler from '../effectHandlerBuilder';

import {
  FORM_SUBMIT_API_CALL
} from '../constants/effects';

import {
  formResponseGot,
  formResetClicked
} from '../actions/FormActions';

export default buildEffectHandler({
  /* When the form is submitted, this side effect is induced,
   * which makes a POST ajax call to the API using axios. This returns
   * a promise, which will then dispatch another action telling the view
   * that the form has been submitted and a response given.
   */
  [FORM_SUBMIT_API_CALL]: (formValues, dispatcher) => {
    axios.post('api/submit_survey', formValues.toJS()).then(
      response => dispatcher.dispatch(formResponseGot({ response }))
    ).catch(
      error => {
        console.error('Error submitting form', error);
        dispatcher.dispatch(formResetClicked());
      }
    );
  }
});
