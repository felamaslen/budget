import axios from 'axios';
import { put, call } from 'redux-saga/effects';

import { API_PREFIX } from '../misc/const';

import { aLoginFormResponseReceived } from '../actions/login.actions';
import { openTimedMessage } from './error.saga';

export function getLoginCredentials() {
    const pin = localStorage && localStorage.getItem
        ? localStorage.getItem('pin')
        : null;

    if (pin) {
        return +pin;
    }

    return null;
}

export function saveLoginCredentials(pin = null) {
    if (!(localStorage && localStorage.setItem && localStorage.removeItem)) {
        return
    }

    if (pin) {
        localStorage.setItem('pin', pin);
    }
    else {
        localStorage.removeItem('pin');
    }
}

export function *submitLoginForm({ payload }, saveDetails = true) {
    const pin = +payload;

    try {
        const response = yield call(axios.post, `${API_PREFIX}/user/login`, { pin });

        // logged in
        if (saveDetails) {
            yield call(saveLoginCredentials, pin);
        }

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

export function *logoutUser() {
    yield call(saveLoginCredentials);
}

