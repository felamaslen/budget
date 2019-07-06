import { eventChannel } from 'redux-saga';
import { select, fork, take, takeLatest, call, put } from 'redux-saga/effects';
import debounce from 'debounce';
import axios from 'axios';

import { windowResized } from '~client/actions/app';
import { dataRead } from '~client/actions/api';
import { errorOpened } from '~client/actions/error';

import { getApiKey } from '~client/selectors/api';

import { LOGGED_IN } from '~client/constants/actions/login';
import { API_PREFIX } from '~client/constants/data';

export function windowResizeEventChannel() {
    return eventChannel(emit => {
        const resizeHandler = debounce(() => emit(windowResized(window.innerWidth)), 50, true);

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

export function *fetchData() {
    const apiKey = yield select(getApiKey);

    try {
        const res = yield call(axios.get, `${API_PREFIX}/data/all`, {
            headers: {
                Authorization: apiKey
            }
        });

        yield put(dataRead(res.data.data));
    } catch (err) {
        yield put(errorOpened(`Error loading data: ${err.message}`));
    }
}

export default function *appSaga() {
    yield fork(watchEventEmitter, windowResizeEventChannel);

    yield takeLatest(LOGGED_IN, fetchData);
}
