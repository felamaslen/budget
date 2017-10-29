import axios from 'axios';
import { put, call } from 'redux-saga/effects';

import { API_PREFIX } from '../misc/const';

import { aLoginFormResponseReceived } from '../actions/LoginActions';
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
        const response = yield axios.post(`${API_PREFIX}/user/login`, { pin });

        // logged in
        if (saveDetails) {
            saveLoginCredentials(pin);
        }

        yield put(aLoginFormResponseReceived(response));
    }
    catch (err) {
        if (err.response) {
            const message = `Login error: ${err.response.data.errorMessage}`;

            yield openTimedMessage(message);
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

