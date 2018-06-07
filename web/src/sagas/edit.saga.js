import { delay } from 'redux-saga';
import { all, fork, select, takeLatest, take, cancel, call, put } from 'redux-saga/effects';
import axios from 'axios';

import { FORM_DIALOG_CLOSED, EDIT_CHANGED, EDIT_SUGGESTIONS_REQUESTED } from '../constants/actions';
import { API_PREFIX, MAX_SUGGESTIONS, PAGES } from '../constants/data';

import { aSuggestionsRequested, aSuggestionsReceived } from '../actions/edit.actions';
import { aMobileDialogClosed } from '../actions/form.actions';
import { getApiKey } from '../selectors/app';
import { getModalState, suggestionsInfo } from '../selectors/edit';
import { addServerDataRequest } from './app.saga';

export function *triggerEditSuggestionsRequest({ page, item, value }) {
    yield call(delay, 100);

    yield put(aSuggestionsRequested({ page, item, value }));
}

export function *watchTextInput() {
    let task = null;

    while (true) {
        yield take(EDIT_CHANGED);

        const { page, item, value } = yield select(suggestionsInfo);

        const itemIsSuggestionCapable = PAGES[page].suggestions &&
            PAGES[page].suggestions.indexOf(item) !== -1;

        if (itemIsSuggestionCapable) {
            if (task) {
                yield cancel(task);
            }

            task = yield fork(triggerEditSuggestionsRequest, { page, item, value });
        }
    }
}

export function *requestEditSuggestions({ reqId, page, item, value }) {
    if (value && value.length) {
        const apiKey = yield select(getApiKey);

        const url = `${API_PREFIX}/data/search/${page}/${item}/${value}/${MAX_SUGGESTIONS}`;

        try {
            const response = yield call(axios.get, url, { headers: { Authorization: apiKey } });

            const data = response.data.data;

            yield put(aSuggestionsReceived({ data, reqId }));
        }
        catch (err) {
            console.warn('Error loading search suggestions');
        }
    }
    else {
        yield put(aSuggestionsReceived({ items: null }));
    }
}

export function *handleModal({ page }) {
    const {
        modalDialogType, invalidKeys, modalDialogLoading, item, fields
    } = yield select(getModalState);

    const proceed = typeof page !== 'undefined' && modalDialogType === 'add' &&
        invalidKeys.size === 0 && modalDialogLoading;

    if (!proceed) {
        return;
    }

    yield call(addServerDataRequest, { item, fields, page });

    yield put(aMobileDialogClosed(null));
}

export default function *editSaga() {
    yield all([
        fork(watchTextInput),
        takeLatest(EDIT_SUGGESTIONS_REQUESTED, requestEditSuggestions),
        takeLatest(FORM_DIALOG_CLOSED, handleModal)
    ]);
}

