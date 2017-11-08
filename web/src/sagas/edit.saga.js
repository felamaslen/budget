import { List as list } from 'immutable';
import { select, call, put } from 'redux-saga/effects';
import axios from 'axios';

import { API_PREFIX, MAX_SUGGESTIONS } from '../misc/const';

import { aSuggestionsReceived } from '../actions/edit.actions';
import { aMobileDialogClosed } from '../actions/form.actions';

import { selectApiKey } from '.'
import { addServerDataRequest } from './app.saga';

export function *requestEditSuggestions({ payload }) {
    const { reqId, page, item, value } = payload;
    if (!value.length) {
        yield put(aSuggestionsReceived({ items: null }));

        return;
    }

    const apiKey = yield select(selectApiKey)

    const url = `${API_PREFIX}/data/search/${page}/${item}/${value}/${MAX_SUGGESTIONS}`;

    try {
        const response = yield call(axios.get, url, { headers: { 'Authorization': apiKey } });

        const items = list(response.data.data.list);

        yield put(aSuggestionsReceived({ items, reqId }));
    }
    catch (err) {
        console.warn('Error loading search suggestions');
    }
}

export const selectModalState = state => ({
    modalDialogType: state.getIn(['modalDialog', 'type']),
    invalidKeys: state.getIn(['modalDialog', 'invalidKeys']),
    modalDialogLoading: state.getIn(['modalDialog', 'loading']),
    item: state.getIn(['modalDialog', 'fieldsString']),
    fields: state.getIn(['modalDialog', 'fieldsValidated'])
})

export function *handleModal({ payload }) {
    const { modalDialogType, invalidKeys, modalDialogLoading, item, fields } = yield select(selectModalState)

    const noContinue = !(payload && modalDialogType === 'add' &&
        invalidKeys.size === 0 && modalDialogLoading);

    if (noContinue) {
        return;
    }

    const { pageIndex } = payload;

    yield call(addServerDataRequest, { item, fields, pageIndex });

    yield put(aMobileDialogClosed(null));
}

