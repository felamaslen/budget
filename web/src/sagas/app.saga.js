import { Map as map } from 'immutable';
import { select, put } from 'redux-saga/effects';
import axios from 'axios';

import { API_PREFIX, ERROR_LEVEL_WARN, LIST_COLS_PAGES, PAGES } from '../misc/const';
import { ERROR_MSG_BAD_DATA } from '../misc/config';

import { aLoginFormSubmitted, aLoginFormResponseReceived } from '../actions/LoginActions';
import { aServerUpdateReceived, aServerAddReceived } from '../actions/AppActions';
import { aListItemAdded } from '../actions/EditActions';
import { stringifyFields, getInvalidInsertDataKeys } from '../reducers/EditReducer';
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
    const loadingApi = yield select(state => state.get('loadingApi'));
    if (loadingApi) {
        yield openTimedMessage('Wait until the previous request has finished', ERROR_LEVEL_WARN);

        return 1;
    }

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
    // TODO: refactor this so most of it is in the reducer
    const { pageIndex, sending } = payload;

    if (sending) {
        return;
    }

    // validate items
    const active = yield select(state => state.getIn(['edit', 'active']));
    let activeItem = null;
    let activeValue = null;
    if (active && active.get('row') === -1) {
        activeItem = active.get('item');
        activeValue = active.get('value');
    }

    const items = yield select(state => state
        .getIn(['edit', 'add', pageIndex])
        .map((value, key) => ({
            item: LIST_COLS_PAGES[pageIndex][key],
            value
        }))
    );

    const fields = items.map(({ item, value }) => map({
        item,
        value: item === activeItem
            ? activeValue
            : value
    }));

    const invalidKeys = getInvalidInsertDataKeys(fields);
    const valid = invalidKeys.size === 0;

    if (!valid) {
        yield openTimedMessage(ERROR_MSG_BAD_DATA, ERROR_LEVEL_WARN);

        return;
    }

    // data is validated
    const item = stringifyFields(fields);

    yield addServerDataRequest({ pageIndex, item, fields });

    yield put(aListItemAdded({ pageIndex, sending: true }));
}


