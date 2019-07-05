/* eslint-disable prefer-reflect */
import test from 'ava';
import axios from 'axios';

import '~client-test/browser';
import { testSaga } from 'redux-saga-test-plan';
import appSaga, {
    watchEventEmitter,
    windowResizeEventChannel,
    fetchData
} from '~client/sagas/app';
import { windowResized } from '~client/actions/app';
import { dataRead } from '~client/actions/api';
import { getApiKey } from '~client/selectors/api';
import { LOGGED_IN } from '~client/constants/actions/login';
import { API_PREFIX } from '~client/constants/data';

test('watchEventEmitter dispatching an action emitted by the channel', t => {
    t.is(1, 1);
    const channel = windowResizeEventChannel();

    testSaga(watchEventEmitter, windowResizeEventChannel)
        .next()
        .call(windowResizeEventChannel)
        .next(channel)
        .take(channel)
        .next(windowResized(100))
        .put(windowResized(100))
        .next()
        .take(channel)
        .next(windowResized(105))
        .put(windowResized(105));
});

test('fetchData gets all data from the API', t => {
    t.is(1, 1);

    const res = { isRes: true };
    const err = new Error('something bad happened');

    testSaga(fetchData)
        .next()
        .select(getApiKey)
        .next('some-api-key')
        .call(axios.get, `${API_PREFIX}/data/all`, {
            headers: {
                Authorization: 'some-api-key'
            }
        })
        .next(res)
        .put(dataRead(res))
        .next()
        .isDone();

    testSaga(fetchData)
        .next()
        .select(getApiKey)
        .next('some-api-key')
        .call(axios.get, `${API_PREFIX}/data/all`, {
            headers: {
                Authorization: 'some-api-key'
            }
        })
        .throw(err)
        .put(dataRead(null, err))
        .next()
        .isDone();
});

test('appSaga forks other sagas', t => {
    t.is(1, 1);

    testSaga(appSaga)
        .next()
        .fork(watchEventEmitter, windowResizeEventChannel)
        .next()
        .takeLatest(LOGGED_IN, fetchData)
        .next()
        .isDone();
});
