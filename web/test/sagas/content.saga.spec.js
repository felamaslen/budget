/* eslint-disable prefer-reflect */
import test from 'ava';
import '~client-test/browser';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';
import * as S from '~client/sagas/content.saga';
import { getApiKey, getContentParamsAnalysis, getLoadedStatus } from '~client/selectors/app';
import { aContentLoaded } from '~client/actions/content.actions';
import { openTimedMessage } from '~client/sagas/error.saga';

test('makeContentRequest calling the API with the correct URL', t => {
    const result = S.makeContentRequest('some_api_key', {
        page: 'analysis', params: ['foo', 'bar'], query: { bar: 'baz' }
    });

    t.deepEqual(result, [
        'api/v4/data/analysis/foo/bar/?bar=baz',
        {
            headers: { Authorization: 'some_api_key' }
        }
    ]);
});

test('requestContent (for the analysis page) working as expected', t => {
    t.is(1, 1);
    testSaga(S.requestContent, { page: 'analysis' })
        .next()
        .select(getLoadedStatus, 'analysis')
        .next(false)
        .select(getContentParamsAnalysis)
        .next({ periodKey: 0, groupingKey: 0, timeIndex: 0 })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, ...S.makeContentRequest('some_api_key', {
            page: 'analysis', params: ['year', 'category', 0], query: {}
        }))
        .next({ foo: 'bar' })
        .put(aContentLoaded({ page: 'analysis', response: { foo: 'bar' } }))
        .next()
        .isDone();
});

test('requestContent (for the analysis page) requesting new data on every load', t => {
    t.is(1, 1);
    testSaga(S.requestContent, { page: 'analysis' })
        .next()
        .select(getLoadedStatus, 'analysis')
        .next(true)
        .select(getContentParamsAnalysis)
        .next({ periodKey: 0, groupingKey: 0, timeIndex: 0 })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, ...S.makeContentRequest('some_api_key', {
            page: 'analysis', params: ['year', 'category', 0], query: {}
        }))
        .next({ foo: 'bar' })
        .put(aContentLoaded({ page: 'analysis', response: { foo: 'bar' } }))
        .next()
        .isDone();
});

test('requestContent (for the analysis page) handleing errors', t => {
    t.is(1, 1);
    testSaga(S.requestContent, { page: 'analysis' })
        .next()
        .select(getLoadedStatus, 'analysis')
        .next(false)
        .select(getContentParamsAnalysis)
        .next({ periodKey: 0, groupingKey: 0, timeIndex: 0 })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, ...S.makeContentRequest('some_api_key', {
            page: 'analysis', params: ['year', 'category', 0], query: {}
        }))
        .throw({ response: 'foo' })
        .call(openTimedMessage, 'An error occurred loading content')
        .next()
        .put(aContentLoaded({ page: 'analysis', response: null }))
        .next()
        .isDone();
});

let envBefore = null;
test.before(() => {
    envBefore = process.env.DEFAULT_FUND_PERIOD;

    process.env.DEFAULT_FUND_PERIOD = 'year1';
});

test.after(() => {
    process.env.DEFAULT_FUND_PERIOD = envBefore;
});

test('requestContent (for the funds page) working as expected', t => {
    t.is(1, 1);
    testSaga(S.requestContent, { page: 'funds' })
        .next()
        .select(getLoadedStatus, 'funds')
        .next(false)
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, ...S.makeContentRequest('some_api_key', {
            page: 'funds', params: [], query: { history: 'true', period: 'year', length: 1 }
        }))
        .next({ foo: 'bar' })
        .put(aContentLoaded({ page: 'funds', response: { foo: 'bar' } }))
        .next()
        .isDone();
});

test('requestContent (for the funds page) noting load data if it is already loaded', t => {
    t.is(1, 1);
    testSaga(S.requestContent, { page: 'funds' })
        .next()
        .select(getLoadedStatus, 'funds')
        .next(true)
        .isDone();
});

test('requestContent (for the funds page) handleing errors', t => {
    t.is(1, 1);
    testSaga(S.requestContent, { page: 'funds' })
        .next()
        .select(getLoadedStatus, 'funds')
        .next(false)
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, ...S.makeContentRequest('some_api_key', {
            page: 'funds', params: [], query: { history: 'true', period: 'year', length: 1 }
        }))
        .throw({ response: 'foo' })
        .call(openTimedMessage, 'An error occurred loading content')
        .next()
        .put(aContentLoaded({ page: 'funds', response: null }))
        .next()
        .isDone();
});

test('requestContent (for all other pages) working as expected', t => {
    t.is(1, 1);
    testSaga(S.requestContent, { page: 'page1' })
        .next()
        .select(getLoadedStatus, 'page1')
        .next(false)
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, ...S.makeContentRequest('some_api_key', {
            page: 'page1', params: [], query: {}
        }))
        .next({ foo: 'bar' })
        .put(aContentLoaded({ page: 'page1', response: { foo: 'bar' } }))
        .next()
        .isDone();
});

test('requestContent (for all other pages) noting load data if it is already loaded', t => {
    t.is(1, 1);
    testSaga(S.requestContent, { page: 'page1' })
        .next()
        .select(getLoadedStatus, 'page1')
        .next(true)
        .isDone();
});

test('requestContent (for all other pages) handleing errors', t => {
    t.is(1, 1);
    testSaga(S.requestContent, { page: 'page1' })
        .next()
        .select(getLoadedStatus, 'page1')
        .next(false)
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, ...S.makeContentRequest('some_api_key', {
            page: 'page1', params: [], query: {}
        }))
        .throw({ response: 'foo' })
        .call(openTimedMessage, 'An error occurred loading content')
        .next()
        .put(aContentLoaded({ page: 'page1', response: null }))
        .next()
        .isDone();
});

