import { eventChannel } from 'redux-saga';
import { all, fork, select, take, takeEvery, takeLatest, call, put } from 'redux-saga/effects';
import axios from 'axios';
import { EDIT_LIST_ITEM_ADDED, SERVER_UPDATED } from '../constants/actions';
import debounce from '../misc/debounce';
import { API_PREFIX } from '../misc/const';
import { aWindowResized, aKeyPressed, aServerUpdateReceived, aServerAddReceived } from '../actions/app.actions';
import { selectApiKey } from '.';
import { openTimedMessage } from './error.saga';

export function keyPressEventChannel() {
    return eventChannel(emitter => {
        const keyPressHandler = debounce(evt => {
            emitter(aKeyPressed({
                key: evt.key,
                shift: evt.shiftKey,
                ctrl: evt.ctrlKey || evt.metaKey
            }));
        }, 1, true);

        const onKeyPress = evt => {
            const tab = evt.key === 'Tab';
            const nav = (evt.ctrlKey || evt.metaKey) && evt.key.indexOf('Arrow') === 0;

            if (tab || nav) {
                evt.preventDefault();
            }

            keyPressHandler(evt);
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

export function *addServerDataRequest({ item, fields, page }) {
    const apiKey = yield select(selectApiKey);

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
    }
}

export const selectAddData = state => ({
    fields: state.getIn(['edit', 'addFields']),
    item: state.getIn(['edit', 'addFieldsString'])
});

export function *addServerData({ page }) {
    // data is validated by reducer
    const { fields, item } = yield select(selectAddData);

    if (fields && item) {
        yield call(addServerDataRequest, { page, item, fields });
    }
}

export default function *appSaga() {
    yield all([
        fork(watchEventEmitter, keyPressEventChannel),
        fork(watchEventEmitter, windowResizeEventChannel),
        takeEvery(EDIT_LIST_ITEM_ADDED, addServerData),
        takeLatest(SERVER_UPDATED, updateServerData)
    ]);
}

