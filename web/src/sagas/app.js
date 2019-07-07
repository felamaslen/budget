import { eventChannel } from 'redux-saga';
import { select, fork, take, takeLatest, call, put } from 'redux-saga/effects';
import { debounce } from 'throttle-debounce';
import axios from 'axios';
import querystring from 'querystring';

import { getFundHistoryQuery } from '~client/sagas/funds';

import { windowResized } from '~client/actions/app';
import { dataRead } from '~client/actions/api';
import { errorOpened } from '~client/actions/error';

import { getApiKey } from '~client/selectors/api';

import { LOGGED_IN } from '~client/constants/actions/login';
import { API_PREFIX } from '~client/constants/data';

export function windowResizeEventChannel() {
    return eventChannel(emit => {
        const resizeHandler = debounce(50, true, () => emit(windowResized(window.innerWidth)));

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
    const query = yield call(getFundHistoryQuery);
    const apiKey = yield select(getApiKey);

    try {
        const res = yield call(axios.get, `${API_PREFIX}/data/all?${querystring.stringify(query)}`, {
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
