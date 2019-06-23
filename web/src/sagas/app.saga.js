import { eventChannel } from 'redux-saga';
import { delay, fork, select, take, takeEvery, takeLatest, call, put } from 'redux-saga/effects';
import { DateTime } from 'luxon';
import debounce from 'debounce';
import axios from 'axios';
import { API_PREFIX } from '~client/constants/data';
import { EDIT_LIST_ITEM_ADDED, SERVER_UPDATED } from '~client/constants/actions';
import { aWindowResized, aKeyPressed, aServerUpdateReceived, aServerAddReceived, aTimeUpdated } from '../actions/app.actions';
import { getApiKey, getRequestList, getAddData } from '~client/selectors/app';
import { openTimedMessage } from './error.saga';

export function keyPressEventChannel() {
    return eventChannel(emitter => {
        const onKeyPress = evt => {
            const tab = evt.key === 'Tab';
            const nav = (evt.ctrlKey || evt.metaKey) && evt.key.indexOf('Arrow') === 0;

            if (tab || nav) {
                evt.preventDefault();
            }

            emitter(aKeyPressed({
                key: evt.key,
                shift: evt.shiftKey,
                ctrl: evt.ctrlKey || evt.metaKey
            }));
        };

        window.addEventListener('keydown', onKeyPress);

        return () => window.removeEventListener('keydown', onKeyPress);
    });
}

export function windowResizeEventChannel() {
    return eventChannel(emitter => {
        const resizeHandler = debounce(() => emitter(aWindowResized(window.innerWidth)), 50, true);

        window.addEventListener('resize', resizeHandler);

        return () => window.removeEventListener('resize', resizeHandler);
    });
}

export function *watchEventEmitter(channelCreator) {
    const channel = yield call(channelCreator);

    while (true) {
        const action = yield take(channel);

        yield put(action);
    }
}

export function *updateServerData() {
    const apiKey = yield select(getApiKey);
    const requestList = yield select(getRequestList);

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

export function *addServerDataRequest({ item, fields, page }) {
    const apiKey = yield select(getApiKey);

    try {
        const response = yield call(
            axios.post,
            `${API_PREFIX}/data/${page}`,
            item,
            { headers: { 'Authorization': apiKey } }
        );

        yield put(aServerAddReceived({ response, fields, page }));
    }
    catch (err) {
        yield call(openTimedMessage, 'Error adding data to server!');

        yield put(aServerAddReceived({ err }));
    }
}

export function *addServerData({ page }) {
    // data is validated by reducer
    const { fields, item } = yield select(getAddData);

    if (fields && item) {
        yield call(addServerDataRequest, { page, item, fields });
    }
}

export function *timeUpdater() {
    while (true) {
        yield delay(1000);

        const now = yield call(DateTime.local);

        yield put(aTimeUpdated(now));
    }
}

export default function *appSaga() {
    yield fork(timeUpdater);
    yield fork(watchEventEmitter, keyPressEventChannel);
    yield fork(watchEventEmitter, windowResizeEventChannel);
    yield takeEvery(EDIT_LIST_ITEM_ADDED, addServerData);
    yield takeLatest(SERVER_UPDATED, updateServerData);
}
