/* eslint-disable prefer-reflect */
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
                'api/v3/data/analysis/foo/bar/?bar=baz',
                {
                    headers: { Authorization: 'some_api_key' }
                }
            ]);
        });
    });

    describe('requestContent', () => {
        it('should work as expected', () => {
            testSaga(S.requestContent, { loading: true, page: 'page1', params: ['foo'], query: { bar: 'baz' } })
                .next()
                .select(selectApiKey)
                .next('some_api_key')
                .call(axios.get, ...S.makeContentRequest('some_api_key', {
                    page: 'page1', params: ['foo'], query: { bar: 'baz' }
                }))
                .next({ foo: 'bar' })
                .put(aContentLoaded({ page: 'page1', response: { foo: 'bar' } }))
                .next()
                .isDone();
        });

        it('should handle errors', () => {
            testSaga(S.requestContent, { loading: true, page: 'page1', params: ['foo'], query: { bar: 'baz' } })
                .next()
                .select(selectApiKey)
                .next('some_api_key')
                .call(axios.get, ...S.makeContentRequest('some_api_key', {
                    page: 'page1', params: ['foo'], query: { bar: 'baz' }
                }))
                .throw({ response: 'foo' })
                .call(openTimedMessage, 'An error occurred loading content')
                .next()
                .put(aContentLoaded({ page: 'page1', response: null }))
                .next()
                .isDone();
        });

        it('should do nothing if loading was not set', () => {
            testSaga(S.requestContent, { loading: false })
                .next()
                .isDone();
        });
    });
});

