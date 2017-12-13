/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import '../browser';
import { expect } from 'chai';
import { select, call, put } from 'redux-saga/effects';
import axios from 'axios';

import { aContentLoaded } from '../../src/actions/content.actions';

import * as S from '../../src/sagas/content.saga';
import { openTimedMessage } from '../../src/sagas/error.saga';
import { selectApiKey } from '../../src/sagas';

describe('content.saga', () => {
    describe('makeContentRequest', () => {
        const result = S.makeContentRequest('some_api_key', {
            pageIndex: 1, params: ['foo', 'bar'], query: { bar: 'baz' }
        });

        it('should call the API with the correct URL', () =>
            expect(result).to.deep.equal(call(axios.get, 'api/v3/data/analysis/foo/bar/?bar=baz', {
                headers: { 'Authorization': 'some_api_key' }
            }))
        );
    });

    describe('requestContent', () => {
        const payload = {
            pageIndex: 0, params: ['foo', 'bar'], query: { bar: 'baz' }
        };
        const iter = S.requestContent({ payload });
        let next = iter.next();

        it('should select the api key', () => {
            expect(next.value).to.deep.equal(select(selectApiKey));
            next = iter.next('some_api_key');
        });
        it('should call makeContentRequest to get the data', () => {
            expect(next.value).to.deep.equal(S.makeContentRequest('some_api_key', payload));
            next = iter.next({ data: { foo: 'bar' } });
        });

        describe('if no error occurred', () => {
            it('should notify the store', () => {
                expect(next.value).to.deep.equal(put(aContentLoaded({
                    pageIndex: 0,
                    response: {
                        data: { foo: 'bar' }
                    }
                })));
            });
        });

        describe('otherwise', () => {
            describe('if the error contained a response', () => {
                const iter2 = S.requestContent({ payload });
                iter2.next(); // select api key
                iter2.next('some_api_key');

                it('should open an error message and notify the store', () => {
                    let next2 = iter2.throw({ response: 'foo' });
                    expect(next2.value).to.deep.equal(call(
                        openTimedMessage, 'An error occurred loading content')
                    );

                    next2 = iter2.next();

                    expect(next2.value).to.deep.equal(put(aContentLoaded({ pageIndex: 0, response: null })));
                });
            });

            const iter3 = S.requestContent({ payload });
            iter3.next(); // select api key
            iter3.next('some_api_key');

            it('should notify the store', () => {
                const next3 = iter3.throw({ message: null });

                expect(next3.value).to.not.deep.equal(call(
                    openTimedMessage, 'An error occurred loading content')
                );

                expect(next3.value).to.deep.equal(put(aContentLoaded({ pageIndex: 0, response: null })));
            });
        });
    });
});

