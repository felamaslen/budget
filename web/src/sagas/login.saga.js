import axios from 'axios';
import { all, takeLatest, put, call } from 'redux-saga/effects';

import { SETTINGS_LOADED, USER_LOGGED_OUT, LOGIN_FORM_SUBMITTED } from '../constants/actions';
import { API_PREFIX } from '../misc/const';

import { aLoginFormResponseReceived, aLoginFormSubmitted } from '../actions/login.actions';
import { openTimedMessage } from './error.saga';

export function *getLoginCredentials() {
    try {
        const pin = yield call([localStorage, 'getItem'], 'pin');

        if (pin) {
            return Number(pin);
        }

        return null;
    }
    catch (err) {
        return null;
    }
}

export function *saveLoginCredentials(pin = null) {
    try {
        if (pin) {
            yield call([localStorage, 'setItem'], 'pin', pin);
        }
        else {
            yield call([localStorage, 'removeItem'], 'pin');
        }
    }
    catch (err) {
        // do nothing
    }
}

export function *submitLoginForm({ pin }) {
    const data = { pin: Number(pin) };

    try {
        const response = yield call(axios.post, `${API_PREFIX}/user/login`, data);

        // logged in
        yield call(saveLoginCredentials, Number(pin));

        yield put(aLoginFormResponseReceived(response));
    }
    catch (err) {
        if (err.response) {
            const message = `Login error: ${err.response.data.errorMessage}`;

            yield call(openTimedMessage, message);
        }
        else {
            console.error(err.stack);
        }

        yield put(aLoginFormResponseReceived(null));
    }
}

export function *autoLogin() {
    const pin = yield call(getLoginCredentials);

    if (pin) {
        yield put(aLoginFormSubmitted(pin));
    }
    else {
        yield put(aLoginFormResponseReceived(null));
    }
}

export function *logoutUser() {
    yield call(saveLoginCredentials);
}

export default function *loginSaga() {
    yield all([
        takeLatest(LOGIN_FORM_SUBMITTED, submitLoginForm),
        takeLatest(SETTINGS_LOADED, autoLogin),
        takeLatest(USER_LOGGED_OUT, logoutUser)
    ]);
}

