/*
 * Carries out actions for the Form component
 */

/**
 * submit the login form
 * @param {Record} reduction: app state
 * @returns {Record} new app state
 */
export function rLoginFormSubmit(reduction) {
    return reduction.setIn(['loginForm', 'visible'], false);
}

/**
 * put a digit on the login form PIN input
 * @param {Record} reduction: app state
 * @param {number} input: digit to add to the form
 * @returns {Record} new app state
 */
export function rLoginFormInput(reduction, input) {
    const inputString = input.toString();
    if (!inputString.match(/^[0-9]$/) || !reduction.getIn(['loginForm', 'visible'])) {
        // don't do anything if the input is non-numeric, or
        // we're still loading a login request
        return reduction;
    }

    const values = reduction.getIn(['loginForm', 'values']);

    return reduction
        .setIn(
            ['loginForm', 'values'],
            values.push(inputString)
        )
        .setIn(
            ['loginForm', 'inputStep'],
            reduction.getIn(['loginForm', 'inputStep']) + 1
        );
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
            ['loginForm', 'values'],
            reduction.getIn(['loginForm', 'values']).slice(0, index)
        )
        .setIn(['loginForm', 'inputStep'], index);
}

export function rLoginFormHandleResponse(reduction, response) {
    const newReduction = rLoginFormReset(reduction)
        .setIn(['loginForm', 'visible'], true)
        .setIn(['loading'], false);

    if (!response) {
        return newReduction;
    }

    // go to the first page after logging in
    const page = Math.max(0, newReduction.getIn(['currentPageIndex']));

    return newReduction
        .setIn(['currentPageIndex'], page)
        .setIn(['loginForm', 'visible'], false)
        .setIn(['user', 'uid'], response.data.uid)
        .setIn(['user', 'name'], response.data.name)
        .setIn(['user', 'apiKey'], response.data.apiKey);
}

