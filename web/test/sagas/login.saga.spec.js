/* eslint-disable prefer-reflect */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { testSaga } from 'redux-saga-test-plan';
import '../browser';
import axios from 'axios';
import * as S from '../../src/sagas/login.saga';
import { openTimedMessage } from '../../src/sagas/error.saga';
import { aLoginFormResponseReceived } from '../../src/actions/login.actions';

describe('Login saga', () => {
    describe('getLoginCredentials', () => {
        it('should get a pin from localStorage', () => {
            testSaga(S.getLoginCredentials)
                .next()
                .call([localStorage, 'getItem'], 'pin')
                .next('1234')
                .isDone();
        });
    });

    describe('saveLoginCredentials', () => {
        it('should set the pin in localStorage', () => {
            testSaga(S.saveLoginCredentials, 1234)
                .next()
                .call([localStorage, 'setItem'], 'pin', 1234)
                .next()
                .isDone();
        });

        it('should remove the pin from localStorage', () => {
            testSaga(S.saveLoginCredentials, null)
                .next()
                .call([localStorage, 'removeItem'], 'pin')
                .next()
                .isDone();
        });
    });

    describe('getLoginPin', () => {
        it('should return a number from the array of pin values in state', () => {
            expect(S.getLoginPin(fromJS({ loginForm: { values: [3, 3, 1, 9] } }))).to.equal(3319);
            expect(S.getLoginPin(fromJS({ loginForm: { values: ['5', '3', '1'] } }))).to.equal(531);
        });
    });

    describe('submitLoginForm', () => {
        it('should do nothing if the pin hasn\'t been completed', () => {
            testSaga(S.submitLoginForm, {})
                .next()
                .select(S.getLoginPin)
                .next(12)
                .isDone();

            testSaga(S.submitLoginForm, {})
                .next()
                .select(S.getLoginPin)
                .next(999)
                .isDone();

            testSaga(S.submitLoginForm, {})
                .next()
                .select(S.getLoginPin)
                .next(10000)
                .isDone();
        });

        it('should log in, saving credentials if successful', () => {
            testSaga(S.submitLoginForm, {})
                .next()
                .select(S.getLoginPin)
                .next(1024)
                .call(axios.post, 'api/v3/user/login', { pin: 1024 })
                .next({ some: 'response' })
                .call(S.saveLoginCredentials, 1024)
                .next()
                .put(aLoginFormResponseReceived({ some: 'response' }))
                .next()
                .isDone();
        });

        it('should handle errors', () => {
            testSaga(S.submitLoginForm, {})
                .next()
                .select(S.getLoginPin)
                .next(9999)
                .call(axios.post, 'api/v3/user/login', { pin: 9999 })
                .throw({
                    response: {
                        data: {
                            errorMessage: 'foo'
                        }
                    }
                })
                .call(openTimedMessage, 'Login error: foo')
                .next()
                .put(aLoginFormResponseReceived(null))
                .next()
                .isDone();
        });

        it('should accept a custom pin parameter', () => {
            testSaga(S.submitLoginForm, { customPin: 9999 })
                .next()
                .call(axios.post, 'api/v3/user/login', { pin: 9999 });
        });
    });

    describe('autoLogin', () => {
        it('should log in automatically', () => {
            testSaga(S.autoLogin)
                .next()
                .call(S.getLoginCredentials)
                .next(9999)
                .call(S.submitLoginForm, { customPin: 9999 })
                .next()
                .isDone();

            testSaga(S.autoLogin)
                .next()
                .call(S.getLoginCredentials)
                .next(null)
                .put(aLoginFormResponseReceived(null))
                .next()
                .isDone();
        });
    });

    describe('logoutUser', () => {
        it('should reset saved credentials', () => {
            testSaga(S.logoutUser)
                .next()
                .call(S.saveLoginCredentials)
                .next()
                .isDone();
        });
    });
});

