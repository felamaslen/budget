/* eslint-disable no-underscore-dangle */
import 'babel-polyfill';
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { select, call, put } from 'redux-saga/effects';

import * as S from '../../src/sagas/analysis.saga';
import * as A from '../../src/actions/analysis.actions';
import { selectApiKey } from '../../src/sagas';
import { makeContentRequest } from '../../src/sagas/content.saga';
import { openTimedMessage } from '../../src/sagas/error.saga';

describe('analysis.saga', () => {
    describe('selectStateProps', () => {
        it('should get the period, grouping and timeIndex', () => {
            expect(S.selectStateProps(fromJS({
                other: {
                    analysis: {
                        period: 100,
                        grouping: 200,
                        timeIndex: 300
                    }
                }
            })))
                .to.deep.equal({
                    period: 100,
                    grouping: 200,
                    timeIndex: 300
                });
        });
    });

    describe('requestAnalysisData', () => {
        describe('if triggered by clicking a deep block', () => {
            const iter = S.requestAnalysisData({
                payload: { pageIndex: 1, name: 'foo', wasDeep: true }
            });

            it('should do nothing', () => expect(iter.next().value).to.be.undefined);
        });

        describe('if the API returns a success response', () => {
            const iter = S.requestAnalysisData({
                payload: { pageIndex: 1, name: 'foo', wasDeep: false }
            });

            let next = null;
            it('should prepare data from the state and call the API', () => {
                next = iter.next();
                expect(next.value).to.deep.equal(select(S.selectStateProps));

                next = iter.next({ period: 1, grouping: 0, timeIndex: 3 });
                expect(next.value).to.deep.equal(select(selectApiKey));

                next = iter.next('some_api_key');
                expect(next.value).to.deep.equal(makeContentRequest('some_api_key', {
                    pageIndex: 1,
                    params: ['deep', 'foo', 'month', 'category', 3]
                }));
            });

            it('should put aAnalysisDataRefreshed once the data comes in', () => {
                next = iter.next({ data: 'foobar' });
                expect(next.value).to.deep.equal(put(A.aAnalysisDataRefreshed({
                    pageIndex: 1, response: { data: 'foobar' }, name: 'foo'
                })));
            });
        });

        describe('if the API returns an error', () => {
            const iter = S.requestAnalysisData({
                payload: { pageIndex: 1, name: 'foo', wasDeep: false }
            });

            iter.next();
            iter.next();
            iter.next();

            it('should pop up an error message', () => {
                expect(iter.throw({ message: 'foo error' }).value)
                    .to.deep.equal(call(openTimedMessage, 'Error loading analysis data: foo error'));
            });
        });
    });
});

