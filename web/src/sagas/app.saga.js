import { select, call, put } from 'redux-saga/effects';
import axios from 'axios';

import { API_PREFIX, PAGES } from '../misc/const';

import { aLoginFormSubmitted, aLoginFormResponseReceived } from '../actions/login.actions';
import { aServerUpdateReceived, aServerAddReceived } from '../actions/app.actions';

import { selectApiKey } from '.'
import { openTimedMessage } from './error.saga';
import { getLoginCredentials } from './login.saga';

export function *loadSettings() {
    const pin = yield call(getLoginCredentials)

    if (pin) {
        yield put(aLoginFormSubmitted(pin));
    }
    else {
        yield put(aLoginFormResponseReceived(null));
    }
}

export const selectRequestList = state => state.getIn(['edit', 'requestList'])
    .map(item => item.get('req'))

export const makePatchRequest = (requestList, apiKey) => axios.patch(
    `${API_PREFIX}/data/multiple`,
    { list: requestList },
    { headers: { 'Authorization': apiKey } }
)

export function *updateServerData() {
    const apiKey = yield select(selectApiKey)
    const requestList = yield select(selectRequestList)

    try {
        const response = yield call(makePatchRequest, requestList, apiKey)

        yield put(aServerUpdateReceived(response));
    }
    catch (err) {
        yield call(openTimedMessage, 'Error updating data on server!')

        yield put(aServerUpdateReceived(null));
    }
}

export const makePostRequest = (item, pageIndex, apiKey) => axios.post(
    `${API_PREFIX}/data/${PAGES[pageIndex]}`,
    item,
    { headers: { 'Authorization': apiKey } }
)

export function *addServerDataRequest({ item, fields, pageIndex }) {
    const apiKey = yield select(selectApiKey)

    try {
        const response = yield call(makePostRequest, item, pageIndex, apiKey)

        yield put(aServerAddReceived({ response, fields, pageIndex }));

        yield 0;
    }
    catch (err) {
        yield call(openTimedMessage, 'Error adding data to server!');

        yield 1;
    }
}

export const selectAddData = state => ({
    fields: state.getIn(['edit', 'addFields']),
    item: state.getIn(['edit', 'addFieldsString'])
})

export function *addServerData({ payload }) {
    const { pageIndex } = payload;

    // data is validated by reducer
    const { fields, item } = yield select(selectAddData)

    if (!(fields && item)) {
        return;
    }

    yield call(addServerDataRequest, { pageIndex, item, fields });
}

