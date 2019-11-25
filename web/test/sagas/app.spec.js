/* eslint-disable prefer-reflect */
import test from 'ava';
import sinon from 'sinon';
import axios from 'axios';
import shortid from 'shortid';

import '~client-test/browser';
import { testSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import appSaga, {
    watchEventEmitter,
    windowResizeEventChannel,
    fetchLegacy,
    fetchNetWorth,
    fetchData,
} from '~client/sagas/app';
import { getFundHistoryQuery } from '~client/sagas/funds';
import { windowResized } from '~client/actions/app';
import { dataRead } from '~client/actions/api';
import { errorOpened } from '~client/actions/error';
import { getApiKey } from '~client/selectors/api';
import { LOGGED_IN } from '~client/constants/actions/login';
import { API_PREFIX } from '~client/constants/data';

test('watchEventEmitter dispatching an action emitted by the channel', (t) => {
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

    t.pass();
});

test('fetchLegacy calls GET /data/all with fund query options', (t) => {
    const res = {
        data: {
            data: { isRes: true },
        },
        headers: {},
    };

    testSaga(fetchLegacy, 'some-api-key')
        .next()
        .call(getFundHistoryQuery)
        .next({ period: 'month', length: 6, history: true })
        .call(axios.get, `${API_PREFIX}/data/all?period=month&length=6&history=true`, {
            headers: {
                Authorization: 'some-api-key',
            },
        })
        .next(res)
        .returns(res.data.data);

    t.pass();
});

test('fetchNetWorth gets categories, subcategories and entries', (t) => {
    const resCategories = { isCategoryRes: true };
    const resSubcategories = { isSubcategoryRes: true };
    const resEntries = { count: 17, data: ['some-data'] };

    const options = { headers: { Authorization: 'some-api-key' } };

    testSaga(fetchNetWorth, 'some-api-key')
        .next()
        .all({
            categories: call(axios.get, `${API_PREFIX}/data/net-worth/categories`, options),
            subcategories: call(axios.get, `${API_PREFIX}/data/net-worth/subcategories`, options),
            entries: call(axios.get, `${API_PREFIX}/data/net-worth`, options),
        })
        .next({
            categories: resCategories,
            subcategories: resSubcategories,
            entries: resEntries,
        })
        .returns({
            categories: resCategories,
            subcategories: resSubcategories,
            entries: resEntries,
        });

    t.pass();
});

test('fetchData gets all data from the API', (t) => {
    const stub = sinon.stub(shortid, 'generate').returns('some-id');

    const resLegacy = { foo: 'bar' };
    const resNetWorth = { bar: 'baz' };

    const err = new Error('something bad happened');

    testSaga(fetchData)
        .next()
        .select(getApiKey)
        .next('some-api-key')
        .all({
            legacy: call(fetchLegacy, 'some-api-key'),
            netWorth: call(fetchNetWorth, 'some-api-key'),
        })
        .next({
            legacy: resLegacy,
            netWorth: resNetWorth,
        })
        .put(dataRead({ ...resLegacy, netWorth: resNetWorth }))
        .next()
        .isDone();

    testSaga(fetchData)
        .next()
        .select(getApiKey)
        .next('some-api-key')
        .all({
            legacy: call(fetchLegacy, 'some-api-key'),
            netWorth: call(fetchNetWorth, 'some-api-key'),
        })
        .throw(err)
        .put(errorOpened('Error loading data: something bad happened'))
        .next()
        .isDone();

    stub.restore();

    t.pass();
});

test('appSaga forks other sagas', (t) => {
    testSaga(appSaga)
        .next()
        .fork(watchEventEmitter, windowResizeEventChannel)
        .next()
        .takeLatest(LOGGED_IN, fetchData)
        .next()
        .isDone();

    t.pass();
});
