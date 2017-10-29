import { select, put } from 'redux-saga/effects';
import axios from 'axios';

import { API_PREFIX, PAGES } from '../misc/const';

import { aLoginFormSubmitted, aLoginFormResponseReceived } from '../actions/login.actions';
import { aServerUpdateReceived, aServerAddReceived } from '../actions/app.actions';
import { openTimedMessage } from './error.saga';
import { getLoginCredentials } from './login.saga';

export function *loadSettings() {
    if (!(localStorage && localStorage.getItem)) {
        console.warn('localStorage not available - settings not saved');

        return;
    }

    const pin = getLoginCredentials();

    if (pin) {
        yield put(aLoginFormSubmitted(pin));
    }
    else {
        yield put(aLoginFormResponseReceived(null));
    }
}

export function *updateServerData() {
    const apiKey = yield select(state => state.getIn(['user', 'apiKey']));
    const requestList = yield select(state => state.getIn(['edit', 'requestList'])
        .map(item => item.get('req'))
    );

    try {
        const response = yield axios.patch(
            `${API_PREFIX}/data/multiple`,
            { list: requestList },
            { headers: { 'Authorization': apiKey } }
        );

        yield put(aServerUpdateReceived(response));
    }
    catch (err) {
        yield openTimedMessage('Error updating data on server!');

        yield put(aServerUpdateReceived(null));
    }
}

export function *addServerDataRequest({ item, fields, pageIndex }) {
    const apiKey = yield select(state => state.getIn(['user', 'apiKey']));

    try {
        const response = yield axios.post(
            `${API_PREFIX}/data/${PAGES[pageIndex]}`,
            item,
            { headers: { 'Authorization': apiKey } }
        );

        yield put(aServerAddReceived({ response, fields, pageIndex }));

        return 0;
    }
    catch (err) {
        yield openTimedMessage('Error adding data to server!');

        return 1;
    }
}

export function *addServerData({ payload }) {
    const { pageIndex } = payload;

    // data is validated by reducer
    const fields = yield select(state => state.getIn(['edit', 'addFields']));
    const item = yield select(state => state.getIn(['edit', 'addFieldsString']));

    if (!(fields && item)) {
        return;
    }

    yield addServerDataRequest({ pageIndex, item, fields });
}

