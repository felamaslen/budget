/*
 * Carries out actions for the Form component
 */

import { Map as map, fromJS } from 'immutable';

import buildMessage from '../messageBuilder';

import {
  FORM_NUM_STEPS,
  formDefaultValues,
  formGetStatus
} from '../config';

import {
  FORM_SUBMIT_API_CALL
} from '../constants/effects';

/* This reducer is run when either a "next" or "submit" button is pressed.
 * If the form is already on the last step, it will cause it to be submitted.
 */
export const formNextStep = (reduction, form) => {
  let newReduction = reduction;

  // first validate the current section of the form
  const formCurrentSection = reduction.getIn(['appState', 'formValues', form.step]);

  let formCurrentSectionValid = true;
  formCurrentSection.forEach((section, key) => {
    const valid = section.get('valid')(section.get('value'));

    newReduction = newReduction.setIn(
      ['appState', 'formValues', form.step, key, 'error'], !valid
    );

    if (!valid) {
      formCurrentSectionValid = false;
    }
  });

  if (!formCurrentSectionValid) {
    // don't go to the next step if the current step hasn't been filled correctly
    return newReduction;
  }

  // increment the current "step" of the form
  newReduction = newReduction.setIn(['appState', 'formStep'], form.step + 1)
  .setIn(['appState', 'formStatusText'], formGetStatus(form.step + 1));

  // if we're at the last step already, submit the form
  if (form.step === FORM_NUM_STEPS - 1) {
    newReduction = submitForm(newReduction);
  }

  return newReduction;
};

const submitForm = reduction => {
  // set the form to render a loading message, and initiate a side effect to submit the form
  const formValuesPost = reduction.getIn(['appState', 'formValues']).map(section => {
    return section.map((input, name) => {
      return map([ [ name, input.get('value') ] ]);
    }).flatten();
  });

  return reduction.setIn(['appState', 'formLoading'], true)
  .set('effects', reduction.get('effects').push(
    buildMessage(FORM_SUBMIT_API_CALL, formValuesPost)
  ));
};

/* Resets the form to the original state for another response */
export const formReset = (reduction, form) => {
  return reduction.setIn(['appState', 'formStep'], 0)
  .setIn(['appState', 'formSubmitted'], false)
  .setIn(['appState', 'formValues'], fromJS(formDefaultValues()))
  .setIn(['appState', 'formLoading'], false)
  .setIn(['appState', 'formStatusText'], formGetStatus(0));
};

/* This is run via a side effect, when a response has been given by the API. */
export const formHandleResponse = (reduction, response) => {
  // mark the form as submitted, so a thank you message can be displayed
  return reduction.setIn(['appState', 'formLoading'], false)
  .setIn(['appState', 'formSubmitted'], true);
};

/* This is run when inputting data to the form, to update the form values. */
export const formUpdateValues = (reduction, input) => {
  // update a form input with the latest value
  const step = reduction.getIn(['appState', 'formStep']);
  return reduction.setIn(['appState', 'formValues', step, input.prop, 'value'], input.value);
};

