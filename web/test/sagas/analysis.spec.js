/* eslint-disable prefer-reflect */
import test from 'ava';
import sinon from 'sinon';
import shortid from 'shortid';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';

import analysisSaga, {
    onRequest,
    onBlockRequest
} from '~client/sagas/analysis';
import { requested, received, blockRequested, blockReceived } from '~client/actions/analysis';
import { errorOpened } from '~client/actions/error';
import {
    getLoadingDeep,
    getPeriod,
    getGrouping,
    getPage
} from '~client/selectors/analysis';
import { getApiKey } from '~client/selectors/api';
import { API_PREFIX } from '~client/constants/data';
import { ANALYSIS_REQUESTED, ANALYSIS_BLOCK_REQUESTED } from '~client/constants/actions/analysis';

test('onRequest requests analysis page data', t => {
    t.is(1, 1);

    const res = { data: { isRes: true } };

    testSaga(onRequest, requested())
        .next()
        .select(getPeriod)
        .next('month')
        .select(getGrouping)
        .next('shop')
        .select(getPage)
        .next(3)
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/analysis/month/shop/3`, {
            headers: { Authorization: 'some api key' }
        })
        .next(res)
        .put(received(res.data))
        .next()
        .isDone();
});

test('onRequest handles errors', t => {
    const stub = sinon.stub(shortid, 'generate').returns('some id');

    t.is(1, 1);

    const err = new Error('something bad happened');

    testSaga(onRequest, requested())
        .next()
        .select(getPeriod)
        .next('month')
        .select(getGrouping)
        .next('shop')
        .select(getPage)
        .next(3)
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/analysis/month/shop/3`, {
            headers: { Authorization: 'some api key' }
        })
        .throw(err)
        .put(errorOpened('Error loading analysis data: something bad happened'))
        .next()
        .put(received(null, err))
        .next()
        .isDone();

    stub.restore();
});

test('onBlockRequest requests analysis deep block data', t => {
    t.is(1, 1);

    const res = { data: { isRes: true } };

    testSaga(onBlockRequest, blockRequested('food'))
        .next()
        .select(getLoadingDeep)
        .next(true)
        .select(getPeriod)
        .next('month')
        .select(getGrouping)
        .next('shop')
        .select(getPage)
        .next(3)
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/analysis/deep/food/month/shop/3`, {
            headers: { Authorization: 'some api key' }
        })
        .next(res)
        .put(blockReceived(res.data))
        .next()
        .isDone();
});

test('onBlockRequest does not do anything if loadingDeep was not set', t => {
    t.is(1, 1);

    testSaga(onBlockRequest, blockRequested('Fish'))
        .next()
        .select(getLoadingDeep)
        .next(false)
        .isDone();
});

test('onBlockRequest handles errors', t => {
    const stub = sinon.stub(shortid, 'generate').returns('some id');

    t.is(1, 1);

    const err = new Error('something bad happened');

    testSaga(onBlockRequest, blockRequested('food'))
        .next()
        .select(getLoadingDeep)
        .next(true)
        .select(getPeriod)
        .next('month')
        .select(getGrouping)
        .next('shop')
        .select(getPage)
        .next(3)
        .select(getApiKey)
        .next('some api key')
        .call(axios.get, `${API_PREFIX}/data/analysis/deep/food/month/shop/3`, {
            headers: { Authorization: 'some api key' }
        })
        .throw(err)
        .put(errorOpened('Error loading analysis data: something bad happened'))
        .next()
        .put(blockReceived(null, err))
        .next()
        .isDone();

    stub.restore();
});

test('analysisSaga forks other sagas', t => {
    t.is(1, 1);

    testSaga(analysisSaga)
        .next()
        .takeLatest(ANALYSIS_REQUESTED, onRequest)
        .next()
        .takeLatest(ANALYSIS_BLOCK_REQUESTED, onBlockRequest)
        .next()
        .isDone();
});
