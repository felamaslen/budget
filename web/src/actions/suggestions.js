import {
    SUGGESTIONS_REQUESTED,
    SUGGESTIONS_RECEIVED,
    SUGGESTIONS_CLEARED,
} from '~client/constants/actions/suggestions';

export const suggestionsRequested = (page, column, search) => ({
    type: SUGGESTIONS_REQUESTED,
    page,
    column,
    search,
});

export const suggestionsReceived = (column, res) => ({
    type: SUGGESTIONS_RECEIVED,
    column,
    res,
});

export const suggestionsCleared = () => ({ type: SUGGESTIONS_CLEARED });
