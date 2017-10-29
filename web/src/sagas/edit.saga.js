import { List as list } from 'immutable';
import { select, put } from 'redux-saga/effects';
import axios from 'axios';

import { API_PREFIX, MAX_SUGGESTIONS } from '../misc/const';

import { aSuggestionsReceived } from '../actions/edit.actions';
import { aMobileDialogClosed } from '../actions/form.actions';
import { addServerDataRequest } from './app.saga';

export function *requestEditSuggestions({ payload }) {
    const { reqId, page, item, value } = payload;
    if (!value.length) {
        yield put(aSuggestionsReceived({ items: null }));

        return;
    }

    const apiKey = yield select(state => state.getIn(['user', 'apiKey']));
    const url = `${API_PREFIX}/data/search/${page}/${item}/${value}/${MAX_SUGGESTIONS}`;

    try {
        const response = yield axios.get(url, { headers: { 'Authorization': apiKey } });

        const items = list(response.data.data.list);

        yield put(aSuggestionsReceived({ items, reqId }));
    }
    catch (err) {
        console.warn('Error loading search suggestions');
    }
}

export function *handleModal({ payload }) {
    const modalDialogType = yield select(state => state.getIn(['modalDialog', 'type']));
    const invalidKeys = yield select(state => state.getIn(['modalDialog', 'invalidKeys']));
    const modalDialogLoading = yield select(state => state.getIn(['modalDialog', 'loading']));

    const noContinue = !(payload && modalDialogType === 'add' &&
        invalidKeys.size === 0 && modalDialogLoading);

    if (noContinue) {
        return;
    }

    const { pageIndex } = payload;

    const item = yield select(state => state.getIn(['modalDialog', 'fieldsString']));
    const fields = yield select(state => state.getIn(['modalDialog', 'fieldsValidated']));

    yield addServerDataRequest({ item, fields, pageIndex });

    yield put(aMobileDialogClosed(null));
}

