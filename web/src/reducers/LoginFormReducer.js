/*
 * Carries out actions for the Form component
 */

import { Map as map } from 'immutable';
import buildMessage from '../messageBuilder';
import {
    EF_LOGIN_FORM_SUBMIT, EF_LOGIN_CREDENTIALS_SAVED
} from '../constants/effects';
import { LOGIN_INPUT_LENGTH, ERROR_LEVEL_ERROR } from '../misc/const';
import { rErrorMessageOpen } from './ErrorReducer';
import { rLoadContent } from './ContentReducer';

/**
 * submit the login form
 * @param {Record} reduction: app state
 * @returns {Record} new app state
 */
export function rLoginFormSubmit(reduction) {
    const pin = reduction.getIn(['appState', 'loginForm', 'values']).join('');

    return reduction.setIn(['appState', 'loginForm', 'loading'], true)
        .set('effects', reduction.get('effects').push(
            buildMessage(EF_LOGIN_FORM_SUBMIT, pin)
        ));
}

/**
 * put a digit on the login form PIN input
 * @param {Record} reduction: app state
 * @param {number} input: digit to add to the form
 * @returns {Record} new app state
 */
export function rLoginFormInput(reduction, input) {
    const inputString = input.toString();
    if (!inputString.match(/^[0-9]$/) || reduction.getIn(['appState', 'loginForm', 'loading'])) {
    // don't do anything if the input is non-numeric, or
    // we're still loading a login request
        return reduction;
    }
    const values = reduction.getIn(['appState', 'loginForm', 'values']);
    const newReduction = reduction.setIn(
        ['appState', 'loginForm', 'values'], values.push(inputString)
    ).setIn(
        ['appState', 'loginForm', 'inputStep'],
        reduction.getIn(['appState', 'loginForm', 'inputStep']) + 1
    );

    // if the pin is incomplete, do nothing
    if (values.size < LOGIN_INPUT_LENGTH - 1) {
        return newReduction;
    }

    return rLoginFormSubmit(newReduction);
}

/**
 * reset the login form PIN input to a certain point
 * @param {Record} reduction: app state
 * @param {number} index: where to reset to
 * @returns {Record} new app state
 */
export function rLoginFormReset(reduction, index = 0) {
    return reduction
        .setIn(
            ['appState', 'loginForm', 'values'],
            reduction.getIn(['appState', 'loginForm', 'values']).slice(0, index)
        )
        .setIn(['appState', 'loginForm', 'inputStep'], index);
}

/**
 * handle login form API response
 * @param {Record} reduction: app state
 * @param {object} output: pin and API response (JSON)
 * @returns {Record} new app state
 */
export function rLoginFormHandleResponse(reduction, req) {
    const newReduction = rLoginFormReset(reduction)
        .setIn(['appState', 'loginForm', 'loading'], false)
        .setIn(['appState', 'loading'], false);

    if (!req) {
        return newReduction;
    }

    if (req.err) {
        const message = map({
            text: `Login error: ${req.err.response.data.errorMessage}`,
            level: ERROR_LEVEL_ERROR
        });

        return rErrorMessageOpen(newReduction, message);
    }

    // go to the first page after logging in
    const page = Math.max(0, newReduction.getIn(['appState', 'currentPageIndex']));

    return rLoadContent(
        newReduction
            .setIn(['appState', 'loginForm', 'loading'], false)
            .setIn(['appState', 'currentPageIndex'], page)
            .setIn(['appState', 'user', 'uid'], req.response.data.uid)
            .setIn(['appState', 'user', 'name'], req.response.data.name)
            .setIn(['appState', 'user', 'apiKey'], req.response.data.apiKey)
            .set('effects', newReduction.get('effects')
                .push(buildMessage(EF_LOGIN_CREDENTIALS_SAVED, req.pin))
            ),
        page
    );
}

