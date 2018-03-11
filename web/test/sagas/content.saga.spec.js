/* eslint-disable prefer-reflect */
import { fromJS } from 'immutable';
import '../browser';
import { expect } from 'chai';
import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';
import * as S from '../../src/sagas/content.saga';
import { aContentLoaded } from '../../src/actions/content.actions';
import { openTimedMessage } from '../../src/sagas/error.saga';
import { selectApiKey } from '../../src/sagas';

describe('content.saga', () => {
    describe('makeContentRequest', () => {
        const result = S.makeContentRequest('some_api_key', {
            page: 'analysis', params: ['foo', 'bar'], query: { bar: 'baz' }
        });

        it('should call the API with the correct URL', () => {
            expect(result).to.deep.equal([
                'api/v4/data/analysis/foo/bar/?bar=baz',
                {
                    headers: { Authorization: 'some_api_key' }
                }
            ]);
        });
    });

    describe('getContentParamsAnalysis', () => {
        it('should get the periodKey and groupingKey from state', () => {
            expect(S.getContentParamsAnalysis(fromJS({
                other: {
                    analysis: {
                        period: 'foo',
                        grouping: 'bar',
                        timeIndex: 'baz'
                    }
                }
            }))).to.deep.equal({
                periodKey: 'foo',
                groupingKey: 'bar',
                timeIndex: 'baz'
            });
        });
    });

    describe('getLoadedStatus', () => {
        it('should return the pagesLoaded status from state', () => {
            expect(S.getLoadedStatus(fromJS({ pagesLoaded: { foo: true, bar: false } }), 'foo')).to.equal(true);
            expect(S.getLoadedStatus(fromJS({ pagesLoaded: { foo: true, bar: false } }), 'bar')).to.equal(false);
            expect(S.getLoadedStatus(fromJS({ pagesLoaded: { foo: true, bar: false } }), 'baz')).to.equal(false);
        });
    });

    describe('requestContent', () => {
        describe('for the analysis page', () => {
            it('should work as expected', () => {
                testSaga(S.requestContent, { page: 'analysis' })
                    .next()
                    .select(S.getLoadedStatus, 'analysis')
                    .next(false)
                    .select(S.getContentParamsAnalysis)
                    .next({ periodKey: 0, groupingKey: 0, timeIndex: 0 })
                    .select(selectApiKey)
                    .next('some_api_key')
                    .call(axios.get, ...S.makeContentRequest('some_api_key', {
                        page: 'analysis', params: ['year', 'category', 0], query: {}
                    }))
                    .next({ foo: 'bar' })
                    .put(aContentLoaded({ page: 'analysis', response: { foo: 'bar' } }))
                    .next()
                    .isDone();
            });

            it('should request new data on every load', () => {
                testSaga(S.requestContent, { page: 'analysis' })
                    .next()
                    .select(S.getLoadedStatus, 'analysis')
                    .next(true)
                    .select(S.getContentParamsAnalysis)
                    .next({ periodKey: 0, groupingKey: 0, timeIndex: 0 })
                    .select(selectApiKey)
                    .next('some_api_key')
                    .call(axios.get, ...S.makeContentRequest('some_api_key', {
                        page: 'analysis', params: ['year', 'category', 0], query: {}
                    }))
                    .next({ foo: 'bar' })
                    .put(aContentLoaded({ page: 'analysis', response: { foo: 'bar' } }))
                    .next()
                    .isDone();
            });

            it('should handle errors', () => {
                testSaga(S.requestContent, { page: 'analysis' })
                    .next()
                    .select(S.getLoadedStatus, 'analysis')
                    .next(false)
                    .select(S.getContentParamsAnalysis)
                    .next({ periodKey: 0, groupingKey: 0, timeIndex: 0 })
                    .select(selectApiKey)
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
        });

        describe('for the funds page', () => {
            let envBefore = null;
            before(() => {
                envBefore = process.env.DEFAULT_FUND_PERIOD;

                process.env.DEFAULT_FUND_PERIOD = 'year1';
            });

            after(() => {
                process.env.DEFAULT_FUND_PERIOD = envBefore;
            });

            it('should work as expected', () => {
                testSaga(S.requestContent, { page: 'funds' })
                    .next()
                    .select(S.getLoadedStatus, 'funds')
                    .next(false)
                    .select(selectApiKey)
                    .next('some_api_key')
                    .call(axios.get, ...S.makeContentRequest('some_api_key', {
                        page: 'funds', params: [], query: { history: 'true', period: 'year', length: 1 }
                    }))
                    .next({ foo: 'bar' })
                    .put(aContentLoaded({ page: 'funds', response: { foo: 'bar' } }))
                    .next()
                    .isDone();
            });

            it('should not load data if it is already loaded', () => {
                testSaga(S.requestContent, { page: 'funds' })
                    .next()
                    .select(S.getLoadedStatus, 'funds')
                    .next(true)
                    .isDone();
            });

            it('should handle errors', () => {
                testSaga(S.requestContent, { page: 'funds' })
                    .next()
                    .select(S.getLoadedStatus, 'funds')
                    .next(false)
                    .select(selectApiKey)
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
        });

        describe('for all other pages', () => {
            it('should work as expected', () => {
                testSaga(S.requestContent, { page: 'page1' })
                    .next()
                    .select(S.getLoadedStatus, 'page1')
                    .next(false)
                    .select(selectApiKey)
                    .next('some_api_key')
                    .call(axios.get, ...S.makeContentRequest('some_api_key', {
                        page: 'page1', params: [], query: {}
                    }))
                    .next({ foo: 'bar' })
                    .put(aContentLoaded({ page: 'page1', response: { foo: 'bar' } }))
                    .next()
                    .isDone();
            });

            it('should not load data if it is already loaded', () => {
                testSaga(S.requestContent, { page: 'page1' })
                    .next()
                    .select(S.getLoadedStatus, 'page1')
                    .next(true)
                    .isDone();
            });

            it('should handle errors', () => {
                testSaga(S.requestContent, { page: 'page1' })
                    .next()
                    .select(S.getLoadedStatus, 'page1')
                    .next(false)
                    .select(selectApiKey)
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
        });
    });
});

