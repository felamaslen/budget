import axios from 'axios';
import querystring from 'querystring';
import { select, call, put } from 'redux-saga/effects';

import { PAGES, API_PREFIX } from '../misc/const';

import { selectApiKey } from '.';
import { openTimedMessage } from './error.saga';
import { aContentLoaded } from '../actions/content.actions';

export function makeContentRequest(apiKey, { pageIndex, params, query }) {
    const path = ['data', PAGES[pageIndex], ...params || []];

    const queryObj = query || {};

    const url = [
        API_PREFIX,
        path.join('/'),
        `?${querystring.stringify(queryObj)}`
    ].join('/');

    return call(axios.get, url, { headers: { Authorization: apiKey } });
}

export function *requestContent({ pageIndex, params, query }) {
    const apiKey = yield select(selectApiKey);

    try {
        const response = yield makeContentRequest(apiKey, { pageIndex, params, query });

        yield put(aContentLoaded({ pageIndex, response }));
    }
    catch (err) {
        if (err.response) {
            yield call(openTimedMessage, 'An error occurred loading content');
        }

        yield put(aContentLoaded({ pageIndex, response: null }));
    }
}

