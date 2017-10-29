import { List as list } from 'immutable';
import { select, put } from 'redux-saga/effects';
import axios from 'axios';

import { API_PREFIX, MAX_SUGGESTIONS } from '../misc/const';

import { aSuggestionsReceived } from '../actions/EditActions';
import { aMobileDialogClosed } from '../actions/FormActions';
import { validateFields } from '../reducers/FormReducer';
import { stringifyFields } from '../reducers/EditReducer';
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
    // TODO: move some of this stuff to reducer
    const modalDialogType = yield select(state => state.getIn(['modalDialog', 'type']));

    if (!payload || payload.deactivate || modalDialogType !== 'add') {
        return;
    }

    const { pageIndex } = payload;

    const rawFields = yield select(state => state.getIn(['modalDialog', 'fields']));

    const { fields, invalidKeys } = validateFields(rawFields);

    if (invalidKeys.size) {
        return;
    }

    const item = stringifyFields(fields);

    yield addServerDataRequest({ item, fields, pageIndex });

    yield put(aMobileDialogClosed(null));

    // TODO: fire this from the container
    // setTimeout(() => dispatch(aMobileDialogClosed({ deactivate: true })), 305);
}


