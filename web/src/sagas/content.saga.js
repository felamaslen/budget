import axios from 'axios';
import querystring from 'querystring';
import { all, select, takeLatest, call, put } from 'redux-saga/effects';

import { CONTENT_REQUESTED } from '../constants/actions';
import { API_PREFIX } from '../misc/const';

import { selectApiKey } from '.';
import { openTimedMessage } from './error.saga';
import { aContentLoaded } from '../actions/content.actions';

export function makeContentRequest(apiKey, { page, params, query }) {
    const path = ['data', page, ...params || []];

    const queryObj = query || {};

    const url = [
        API_PREFIX,
        path.join('/'),
        `?${querystring.stringify(queryObj)}`
    ].join('/');

    return [url, { headers: { Authorization: apiKey } }];
}

export function *requestContent({ page, loading, params, query }) {
    if (!loading) {
        return;
    }

    const apiKey = yield select(selectApiKey);

    try {
        const response = yield call(axios.get, ...makeContentRequest(apiKey, { page, params, query }));

        yield put(aContentLoaded({ page, response }));
    }
    catch (err) {
        if (err.response) {
            yield call(openTimedMessage, 'An error occurred loading content');
        }

        yield put(aContentLoaded({ page, response: null }));
    }
}

export default function *contentSaga() {
    yield all([
        takeLatest(CONTENT_REQUESTED, requestContent)
    ]);
}

