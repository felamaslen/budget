/* eslint-disable prefer-reflect */
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';

import * as S from '../../src/sagas/analysis.saga';
import * as A from '../../src/actions/analysis.actions';
import { makeContentRequest } from '../../src/sagas/content.saga';
import { openTimedMessage } from '../../src/sagas/error.saga';
import { getApiKey } from '../../src/selectors/app';
import { requestProps } from '../../src/selectors/analysis';

describe('analysis.saga', () => {
    describe('requestAnalysisData', () => {
        it('should do nothing if triggered by clicking a deep block', () => {
            testSaga(S.requestAnalysisData, { wasDeep: true })
                .next()
                .isDone();
        });

        it('should do nothing if not set to loading', () => {
            testSaga(S.requestAnalysisData, {})
                .next()
                .select(requestProps)
                .next({ loading: false })
                .isDone();
        });

        it('should work as expected', () => {
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

        it('should handle errors', () => {
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
    });
});

