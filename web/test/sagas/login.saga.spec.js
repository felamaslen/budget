import 'babel-polyfill';
import { expect } from 'chai';
import axios from 'axios';
import * as S from '../../src/sagas/login.saga';

import { put, call } from 'redux-saga/effects';
import { cloneableGenerator } from 'redux-saga/utils';

import { aLoginFormResponseReceived } from '../../src/actions/login.actions';
import { openTimedMessage } from '../../src/sagas/error.saga';

describe('login.saga', () => {
    describe('submitLoginForm', () => {
        const iter = cloneableGenerator(S.submitLoginForm)({
            payload: '1024'
        });

        it('should call the API', () => {
            expect(iter.next().value).to.deep.equal(call(axios.post, 'api/v3/user/login', {
                pin: 1024
            }));
        });
        describe('if the request was successful', () => {
            const iter2 = iter.clone();
            iter2.next();
            let next = iter2.next('foo');

            it('should save the details', () => {
                expect(next.value).to.deep.equal(call(S.saveLoginCredentials, 1024));
                next = iter2.next();
            });
            it('should notify the store', () => {
                expect(next.value).to.deep.equal(put(aLoginFormResponseReceived('foo')));
            });
        });
        describe('otherwise', () => {
            it('should be tested');
        });
    });
});

