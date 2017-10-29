import axios from 'axios';
import querystring from 'querystring';
import { select, put } from 'redux-saga/effects';

import { PAGES, API_PREFIX } from '../misc/const';

import { openTimedMessage } from './error.saga';
import { aContentLoaded } from '../actions/content.actions';

export function makeContentRequest(apiKey, { pageIndex, params, query }) {
    const path = ['data', PAGES[pageIndex]].concat(params || []);

    const queryObj = query || {};

    const url = [
        API_PREFIX,
        path.join('/'),
        `?${querystring.stringify(queryObj)}`
    ].join('/');

    return axios.get(url, { headers: { 'Authorization': apiKey } });
}

export function *requestContent({ payload }) {
    const { pageIndex, params, query } = payload;

    const apiKey = yield select(state => state.getIn(['user', 'apiKey']));

    try {
        const response = yield makeContentRequest(apiKey, { pageIndex, params, query });

        yield put(aContentLoaded({ pageIndex, response }));
    }
    catch (err) {
        if (err.response) {
            yield openTimedMessage('An error occurred loading content');
        }
        else {
            console.error(err.stack);
        }

        yield put(aContentLoaded({ pageIndex, response: null }));
    }
}

