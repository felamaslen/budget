/* eslint-disable prefer-reflect */
import test from 'ava';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';

import * as S from '~client/sagas/analysis.saga';
import * as A from '~client/actions/analysis.actions';
import { makeContentRequest } from '~client/sagas/content.saga';
import { openTimedMessage } from '~client/sagas/error.saga';
import { getApiKey } from '~client/selectors/app';
import { requestProps } from '~client/selectors/analysis';

test('requestAnalysisData doing nothing if triggered by clicking a deep block', t => {
    t.is(1, 1);
    testSaga(S.requestAnalysisData, { wasDeep: true })
        .next()
        .isDone();
});

test('requestAnalysisData doing nothing if not set to loading', t => {
    t.is(1, 1);
    testSaga(S.requestAnalysisData, {})
        .next()
        .select(requestProps)
        .next({ loading: false })
        .isDone();
});

test('requestAnalysisData working as expected', t => {
    t.is(1, 1);
    testSaga(S.requestAnalysisData, { name: 'foo', wasDeep: false })
        .next()
        .select(requestProps)
        .next({ loading: true, period: 1, grouping: 0, timeIndex: 3 })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, ...makeContentRequest('some_api_key', {
            page: 'analysis', params: ['deep', 'foo', 'month', 'category', 3]
        }))
        .next({ data: 'foobar' })
        .put(A.aAnalysisDataRefreshed({ response: { data: 'foobar' }, name: 'foo' }))
        .next()
        .isDone();
});

test('requestAnalysisData handling errors', t => {
    t.is(1, 1);
    testSaga(S.requestAnalysisData, { name: 'foo', wasDeep: false })
        .next()
        .select(requestProps)
        .next({ loading: true, period: 1, grouping: 0, timeIndex: 3 })
        .select(getApiKey)
        .next('some_api_key')
        .call(axios.get, ...makeContentRequest('some_api_key', {
            page: 'analysis', params: ['deep', 'foo', 'month', 'category', 3]
        }))
        .throw(new Error('some error'))
        .call(openTimedMessage, 'Error loading analysis data: some error')
        .next()
        .isDone();
});

