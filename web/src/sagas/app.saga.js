import { eventChannel } from 'redux-saga';
import { all, fork, select, take, takeEvery, takeLatest, call, put } from 'redux-saga/effects';
import axios from 'axios';
import debounce from '../misc/debounce';

import { EDIT_LIST_ITEM_ADDED, SERVER_UPDATED } from '../constants/actions';
import { API_PREFIX, PAGES } from '../misc/const';

import { aKeyPressed, aServerUpdateReceived, aServerAddReceived } from '../actions/app.actions';

import { selectApiKey } from '.';
import { openTimedMessage } from './error.saga';

function keyPressEventChannel() {
    return eventChannel(emitter => {
        const keyPressHandler = debounce(evt => {
            emitter(aKeyPressed({
                key: evt.key,
                shift: evt.shiftKey,
                ctrl: evt.ctrlKey
            }));
        }, 1, true);

        const onKeyPress = evt => {
            if (evt.key === 'Tab') {
                evt.preventDefault();
            }

            keyPressHandler(evt);
        };

        window.addEventListener('keydown', onKeyPress);

        return () => {
            window.removeEventListener('keydown', onKeyPress);
        };
    });
}

export function *watchKeyPress() {
    const channel = keyPressEventChannel();

    while (true) {
        const action = yield take(channel);

        yield put(action);
    }
}

export const selectRequestList = state => state.getIn(['edit', 'requestList'])
    .map(item => item.get('req'));

export function *updateServerData() {
    const apiKey = yield select(selectApiKey);
    const requestList = yield select(selectRequestList);

    try {
        const response = yield call(
            axios.patch,
            `${API_PREFIX}/data/multiple`,
            { list: requestList },
            { headers: { 'Authorization': apiKey } }
        );

        yield put(aServerUpdateReceived(response));
    }
    catch (err) {
        yield call(openTimedMessage, 'Error updating data on server!');

        yield put(aServerUpdateReceived(null));
    }
}

export function *addServerDataRequest({ item, fields, pageIndex }) {
    const apiKey = yield select(selectApiKey);

    try {
        const response = yield call(
            axios.post,
            `${API_PREFIX}/data/${PAGES[pageIndex]}`,
            item,
            { headers: { 'Authorization': apiKey } }
        );

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
});

export function *addServerData({ pageIndex }) {
    // data is validated by reducer
    const { fields, item } = yield select(selectAddData);

    if (fields && item) {
        yield call(addServerDataRequest, { pageIndex, item, fields });
    }
}

export default function *appSaga() {
    yield all([
        fork(watchKeyPress),
        takeEvery(EDIT_LIST_ITEM_ADDED, addServerData),
        takeLatest(SERVER_UPDATED, updateServerData)
    ]);
}

