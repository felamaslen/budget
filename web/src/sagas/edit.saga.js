import { List as list } from 'immutable';
import { delay } from 'redux-saga';
import { all, fork, select, takeLatest, take, cancel, call, put } from 'redux-saga/effects';
import axios from 'axios';

import { FORM_DIALOG_CLOSED, EDIT_CHANGED, EDIT_SUGGESTIONS_REQUESTED } from '../constants/actions';
import { API_PREFIX, PAGES, MAX_SUGGESTIONS, LIST_COLS_SUGGESTIONS } from '../misc/const';

import { aSuggestionsRequested, aSuggestionsReceived } from '../actions/edit.actions';
import { aMobileDialogClosed } from '../actions/form.actions';

import { selectApiKey } from '.';
import { addServerDataRequest } from './app.saga';

export const suggestionsInfo = reduction => ({
    pageIndex: reduction.get('currentPageIndex'),
    item: reduction.getIn(['edit', 'active', 'item']),
    value: reduction.getIn(['edit', 'active', 'value'])
});

export function *triggerEditSuggestionsRequest({ pageIndex, item, value }) {
    yield call(delay, 100);

    yield put(aSuggestionsRequested({
        page: PAGES[pageIndex],
        item,
        value
    }));
}

export function *watchTextInput() {
    let task = null;

    while (true) {
        yield take(EDIT_CHANGED);

        const { pageIndex, item, value } = yield select(suggestionsInfo);

        const itemIsSuggestionCapable = LIST_COLS_SUGGESTIONS[pageIndex].indexOf(item) !== -1;
        if (itemIsSuggestionCapable) {
            if (task) {
                yield cancel(task);
            }

            task = yield fork(triggerEditSuggestionsRequest, { pageIndex, item, value });
        }
    }
}

export function *requestEditSuggestions({ reqId, page, item, value }) {
    if (value && value.length) {
        const apiKey = yield select(selectApiKey);

        const url = `${API_PREFIX}/data/search/${page}/${item}/${value}/${MAX_SUGGESTIONS}`;

        try {
            const response = yield call(axios.get, url, { headers: { Authorization: apiKey } });

            const items = list(response.data.data.list);

            yield put(aSuggestionsReceived({ items, reqId }));
        }
        catch (err) {
            console.warn('Error loading search suggestions');
        }
    }
    else {
        yield put(aSuggestionsReceived({ items: null }));
    }
}

export const selectModalState = state => ({
    modalDialogType: state.getIn(['modalDialog', 'type']),
    invalidKeys: state.getIn(['modalDialog', 'invalidKeys']),
    modalDialogLoading: state.getIn(['modalDialog', 'loading']),
    item: state.getIn(['modalDialog', 'fieldsString']),
    fields: state.getIn(['modalDialog', 'fieldsValidated'])
});

export function *handleModal({ pageIndex }) {
    const {
        modalDialogType, invalidKeys, modalDialogLoading, item, fields
    } = yield select(selectModalState);

    const proceed = typeof pageIndex !== 'undefined' && modalDialogType === 'add' &&
        invalidKeys.size === 0 && modalDialogLoading;

    if (!proceed) {
        return;
    }

    yield call(addServerDataRequest, { item, fields, pageIndex });

    yield put(aMobileDialogClosed(null));
}

export default function *editSaga() {
    yield all([
        fork(watchTextInput),
        takeLatest(EDIT_SUGGESTIONS_REQUESTED, requestEditSuggestions),
        takeLatest(FORM_DIALOG_CLOSED, handleModal)
    ]);
}

