import { takeLatest, select, call, put } from 'redux-saga/effects';
import axios from 'axios';

import { getApiKey } from '~client/selectors/api';

import { API_PREFIX, PAGES_SUGGESTIONS, MAX_SUGGESTIONS } from '~client/constants/data';

import { SUGGESTIONS_REQUESTED } from '~client/constants/actions/suggestions';
import { suggestionsReceived, suggestionsCleared } from '~client/actions/suggestions';
import { errorOpened } from '~client/actions/error';

export function *onRequest({ page, column, search }) {
    if (!PAGES_SUGGESTIONS.includes(page)) {
        return;
    }

    const apiKey = yield select(getApiKey);

    try {
        const res = yield call(axios.get, `${API_PREFIX}/data/search/${page}/${column}/${search}/${MAX_SUGGESTIONS}`, {
            headers: {
                Authorization: apiKey
            }
        });

        yield put(suggestionsReceived(column, res.data.data));
    } catch (err) {
        yield put(errorOpened(`Error loading suggestions: ${err.message}`));
        yield put(suggestionsCleared());
    }
}

export default function *suggestionsSaga() {
    yield takeLatest(SUGGESTIONS_REQUESTED, onRequest);
}
