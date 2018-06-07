/*
 * Carries out actions for the Form component
 */

import { PAGES, LOGIN_INPUT_LENGTH } from '../constants/data';

export function rLoginFormInput(state, { input }) {
    const inputString = input.toString();
    if (!(inputString.match(/^[0-9]$/) && state.getIn(['loginForm', 'visible']))) {
        // don't do anything if the input is non-numeric, or
        // we're still loading a login request
        return state;
    }

    const values = state.getIn(['loginForm', 'values']);

    const active = values.size < LOGIN_INPUT_LENGTH - 1;

    return state
        .setIn(['loginForm', 'values'], values.push(inputString))
        .setIn(['loginForm', 'inputStep'], state.getIn(['loginForm', 'inputStep']) + 1)
        .setIn(['loginForm', 'active'], active);
}

export function rLoginFormReset(state, req) {
    const index = req
        ? req.index
        : 0;

    return state
        .setIn(['loginForm', 'values'],
            state.getIn(['loginForm', 'values']).slice(0, index))
        .setIn(['loginForm', 'inputStep'], index);
}

export function rLoginFormSubmit(state) {
    return state.setIn(['loginForm', 'active'], false);
}

export function rLoginFormHandleResponse(state, { data }) {
    const nextState = rLoginFormReset(state)
        .setIn(['loginForm', 'active'], true)
        .setIn(['loginForm', 'visible'], true)
        .setIn(['loading'], false);

    if (!data) {
        return nextState;
    }

    // go to the first page after logging in
    const page = Object.keys(PAGES)[0];

    return nextState
        .set('currentPage', page)
        .setIn(['loginForm', 'visible'], false)
        .setIn(['user', 'uid'], data.uid)
        .setIn(['user', 'name'], data.name)
        .setIn(['user', 'apiKey'], data.apiKey);
}

