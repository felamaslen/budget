import { eventChannel } from 'redux-saga';
import {
    select, fork, take, takeLatest, all, call, put,
} from 'redux-saga/effects';
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
    return eventChannel((emit) => {
        const resizeHandler = debounce(50, true, () => emit(windowResized(window.innerWidth)));

        window.addEventListener('resize', resizeHandler);

        return () => window.removeEventListener('resize', resizeHandler);
    });
}

export function* watchEventEmitter(channelCreator) {
    const channel = yield call(channelCreator);

    while (true) {
        const action = yield take(channel);

        yield put(action);
    }
}

const getOptions = (apiKey) => ({
    headers: {
        Authorization: apiKey,
    },
});

export function* fetchLegacy(apiKey) {
    const query = yield call(getFundHistoryQuery);

    const res = yield call(axios.get, `${API_PREFIX}/data/all?${querystring.stringify(query)}`,
        getOptions(apiKey));

    return res.data.data;
}

export function* fetchNetWorth(apiKey) {
    const options = getOptions(apiKey);

    const res = yield all({
        categories: call(axios.get, `${API_PREFIX}/data/net-worth/categories`, options),
        subcategories: call(axios.get, `${API_PREFIX}/data/net-worth/subcategories`, options),
        entries: call(axios.get, `${API_PREFIX}/data/net-worth`, options),
    });

    return res;
}

export function* fetchData() {
    const apiKey = yield select(getApiKey);

    try {
        const {
            legacy,
            netWorth,
        } = yield all({
            legacy: call(fetchLegacy, apiKey),
            netWorth: call(fetchNetWorth, apiKey),
        });

        const res = { ...legacy, netWorth };

        yield put(dataRead(res));
    } catch (err) {
        yield put(errorOpened(`Error loading data: ${err.message}`));
    }
}

export default function* appSaga() {
    yield fork(watchEventEmitter, windowResizeEventChannel);

    yield takeLatest(LOGGED_IN, fetchData);
}
