/* eslint-disable prefer-reflect */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';

import * as S from '../../src/sagas/analysis.saga';
import * as A from '../../src/actions/analysis.actions';
import { selectApiKey } from '../../src/sagas';
import { makeContentRequest } from '../../src/sagas/content.saga';
import { openTimedMessage } from '../../src/sagas/error.saga';

describe('analysis.saga', () => {
    describe('selectStateProps', () => {
        it('should get the loading status, period, grouping and timeIndex', () => {
            expect(S.selectStateProps(fromJS({
                other: {
                    analysis: {
                        loading: true,
                        period: 100,
                        grouping: 200,
                        timeIndex: 300
                    }
                }
            })))
                .to.deep.equal({
                    loading: true,
                    period: 100,
                    grouping: 200,
                    timeIndex: 300
                });
        });
    });

    describe('requestAnalysisData', () => {
        it('should do nothing if triggered by clicking a deep block', () => {
            testSaga(S.requestAnalysisData, { wasDeep: true })
                .next()
                .isDone();
        });

        it('should do nothing if not set to loading', () => {
            testSaga(S.requestAnalysisData, {})
                .next()
                .select(S.selectStateProps)
                .next({ loading: false })
                .isDone();
        });

        it('should work as expected', () => {
            testSaga(S.requestAnalysisData, { name: 'foo', wasDeep: false })
                .next()
                .select(S.selectStateProps)
                .next({ loading: true, period: 1, grouping: 0, timeIndex: 3 })
                .select(selectApiKey)
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
                .select(S.selectStateProps)
                .next({ loading: true, period: 1, grouping: 0, timeIndex: 3 })
                .select(selectApiKey)
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

