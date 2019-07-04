/* eslint-disable prefer-reflect */
import test from 'ava';
import sinon from 'sinon';
import { testSaga } from 'redux-saga-test-plan';
import '~client-test/browser';
import axios from 'axios';
import shortid from 'shortid';

import loginSaga, {
    onLoginAttempt,
    onLogout,
    autoLogin
} from '~client/sagas/login';
import { loginErrorOccurred, loginRequested, loggedIn, loggedOut } from '~client/actions/login';
import { LOGIN_REQUESTED, LOGGED_OUT } from '~client/constants/actions/login';
import { errorOpened } from '~client/actions/error';

test('onLoginAttempt tries to log in', t => {
    t.is(1, 1);

    const res = { isRes: true };

    testSaga(onLoginAttempt, loginRequested(1024))
        .next()
        .call(axios.post, '/api/v4/user/login', { pin: 1024 })
        .next(res)
        .call([localStorage, 'setItem'], 'pin', 1024)
        .next()
        .put(loggedIn(res))
        .next()
        .isDone();
});

test('onLoginAttempt displays errors', t => {
    t.is(1, 1);

    const err = new Error('Something bad happened');
    err.response = {
        data: {
            err: 'foo'
        }
    };

    const stub = sinon.stub(shortid, 'generate').returns('some-id');

    testSaga(onLoginAttempt, loginRequested(9999))
        .next()
        .call(axios.post, '/api/v4/user/login', { pin: 9999 })
        .throw(err)
        .put(errorOpened('Login error: foo'))
        .next()
        .put(loginErrorOccurred(err))
        .next()
        .put(loggedOut())
        .next()
        .isDone();

    stub.restore();
});

test('onLogout resets saved credentials', t => {
    t.is(1, 1);
    testSaga(onLogout)
        .next()
        .call([localStorage, 'removeItem'], 'pin')
        .next()
        .isDone();
});

test('autoLogin tries to log in automatically', t => {
    t.is(1, 1);
    testSaga(autoLogin)
        .next()
        .call([localStorage, 'getItem'], 'pin')
        .next('1234')
        .call(onLoginAttempt, loginRequested(1234))
        .next()
        .isDone();

    testSaga(autoLogin)
        .next()
        .call([localStorage, 'getItem'], 'pin')
        .throw('localStorage not supported')
        .isDone();

    testSaga(autoLogin)
        .next()
        .call([localStorage, 'getItem'], 'pin')
        .next('not a number')
        .put(loggedOut())
        .next()
        .isDone();
});

test('loginSaga yields all other sagas', t => {
    t.is(1, 1);
    testSaga(loginSaga)
        .next()
        .takeLatest(LOGIN_REQUESTED, onLoginAttempt)
        .next()
        .takeLatest(LOGGED_OUT, onLogout)
        .next()
        .fork(autoLogin)
        .next()
        .isDone();
});
