/* eslint-disable prefer-reflect */
import test from 'ava';
import sinon from 'sinon';
import axios from 'axios';
import shortid from 'shortid';

import '~client-test/browser';
import { testSaga } from 'redux-saga-test-plan';
import appSaga, {
    watchEventEmitter,
    windowResizeEventChannel,
    fetchData
} from '~client/sagas/app';
import { getFundHistoryQuery } from '~client/sagas/funds';
import { windowResized } from '~client/actions/app';
import { dataRead } from '~client/actions/api';
import { errorOpened } from '~client/actions/error';
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

    const stub = sinon.stub(shortid, 'generate').returns('some-id');

    const res = {
        data: {
            data: { isRes: true }
        },
        headers: {}
    };
    const err = new Error('something bad happened');

    testSaga(fetchData)
        .next()
        .call(getFundHistoryQuery)
        .next({ period: 'month', length: 6, history: true })
        .select(getApiKey)
        .next('some-api-key')
        .call(axios.get, `${API_PREFIX}/data/all?period=month&length=6&history=true`, {
            headers: {
                Authorization: 'some-api-key'
            }
        })
        .next(res)
        .put(dataRead(res.data.data))
        .next()
        .isDone();

    testSaga(fetchData)
        .next()
        .call(getFundHistoryQuery)
        .next({ period: 'month', length: 6, history: true })
        .select(getApiKey)
        .next('some-api-key')
        .call(axios.get, `${API_PREFIX}/data/all?period=month&length=6&history=true`, {
            headers: {
                Authorization: 'some-api-key'
            }
        })
        .throw(err)
        .put(errorOpened('Error loading data: something bad happened'))
        .next()
        .isDone();

    stub.restore();
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
