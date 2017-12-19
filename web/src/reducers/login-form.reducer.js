/*
 * Carries out actions for the Form component
 */

export function rLoginFormInput(reduction, { input }) {
    const inputString = input.toString();
    if (!(inputString.match(/^[0-9]$/) && reduction.getIn(['loginForm', 'visible']))) {
        // don't do anything if the input is non-numeric, or
        // we're still loading a login request
        return reduction;
    }

    const values = reduction.getIn(['loginForm', 'values']);

    return reduction
        .setIn(['loginForm', 'values'], values.push(inputString))
        .setIn(['loginForm', 'inputStep'], reduction.getIn(['loginForm', 'inputStep']) + 1);
}

export function rLoginFormReset(reduction, req) {
    const index = req
        ? req.index
        : 0;

    return reduction
        .setIn(['loginForm', 'values'],
            reduction.getIn(['loginForm', 'values']).slice(0, index))
        .setIn(['loginForm', 'inputStep'], index);
}

export function rLoginFormSubmit(reduction) {
    return reduction.setIn(['loginForm', 'active'], false);
}

export function rLoginFormHandleResponse(reduction, { data }) {
    const newReduction = rLoginFormReset(reduction)
        .setIn(['loginForm', 'active'], true)
        .setIn(['loginForm', 'visible'], true)
        .setIn(['loading'], false);

    if (!(data)) {
        return newReduction;
    }

    // go to the first page after logging in
    const pageIndex = Math.max(0, newReduction.get('currentPageIndex'));

    return newReduction
        .set('currentPageIndex', pageIndex)
        .setIn(['loginForm', 'visible'], false)
        .setIn(['user', 'uid'], data.uid)
        .setIn(['user', 'name'], data.name)
        .setIn(['user', 'apiKey'], data.apiKey);
}

