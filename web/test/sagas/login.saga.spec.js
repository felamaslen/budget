/* eslint-disable prefer-reflect */
import test from 'ava';
import { fromJS } from 'immutable';
import { testSaga } from 'redux-saga-test-plan';
import '~client-test/browser';
import axios from 'axios';
import * as S from '~client/sagas/login.saga';
import { openTimedMessage } from '~client/sagas/error.saga';
import { aLoginFormResponseReceived } from '~client/actions/login.actions';

test('getLoginCredentials geting a pin from localStorage', t => {
    t.is(1, 1);
    testSaga(S.getLoginCredentials)
        .next()
        .call([localStorage, 'getItem'], 'pin')
        .next('1234')
        .isDone();
});

test('saveLoginCredentials seting the pin in localStorage', t => {
    t.is(1, 1);
    testSaga(S.saveLoginCredentials, 1234)
        .next()
        .call([localStorage, 'setItem'], 'pin', 1234)
        .next()
        .isDone();
});

test('saveLoginCredentials removeing the pin from localStorage', t => {
    t.is(1, 1);
    testSaga(S.saveLoginCredentials, null)
        .next()
        .call([localStorage, 'removeItem'], 'pin')
        .next()
        .isDone();
});

test('getLoginPin returning a number from the array of pin values in state', t => {
    t.is(S.getLoginPin(fromJS({ loginForm: { values: [3, 3, 1, 9] } })), 3319);
    t.is(S.getLoginPin(fromJS({ loginForm: { values: ['5', '3', '1'] } })), 531);
});

test('getLoginPin doing nothing if the pin hasn\'t been completed', t => {
    t.is(1, 1);
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

test('getLoginPin loging in, saving credentials if successful', t => {
    t.is(1, 1);
    testSaga(S.submitLoginForm, {})
        .next()
        .select(S.getLoginPin)
        .next(1024)
        .call(axios.post, '/api/v4/user/login', { pin: 1024 })
        .next({ some: 'response' })
        .call(S.saveLoginCredentials, 1024)
        .next()
        .put(aLoginFormResponseReceived({ some: 'response' }))
        .next()
        .isDone();
});

test('getLoginPin handleing errors', t => {
    t.is(1, 1);
    testSaga(S.submitLoginForm, {})
        .next()
        .select(S.getLoginPin)
        .next(9999)
        .call(axios.post, '/api/v4/user/login', { pin: 9999 })
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

test('getLoginPin accepting a custom pin parameter', t => {
    t.is(1, 1);
    testSaga(S.submitLoginForm, { customPin: 9999 })
        .next()
        .call(axios.post, '/api/v4/user/login', { pin: 9999 });
});

test('autoLogin loging in automatically', t => {
    t.is(1, 1);
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

test('logoutUser reseting saved credentials', t => {
    t.is(1, 1);
    testSaga(S.logoutUser)
        .next()
        .call(S.saveLoginCredentials)
        .next()
        .isDone();
});
