import axios from 'axios';
import { select, all, takeLatest, put, call } from 'redux-saga/effects';

import { SETTINGS_LOADED, USER_LOGGED_OUT, LOGIN_FORM_INPUTTED, KEY_PRESSED } from '../constants/actions';
import { API_PREFIX, LOGIN_INPUT_LENGTH } from '../misc/const';

import { aLoginFormResponseReceived } from '../actions/login.actions';
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

export const getLoginPin = state => {
    if (state.getIn(['user', 'uid']) > 0) {
        return '';
    }

    return Number(state
        .getIn(['loginForm', 'values'])
        .join('')
    );
};

export function *submitLoginForm({ customPin }) {
    let pin = customPin;
    if (!pin) {
        pin = yield select(getLoginPin);
    }

    if (pin.toString().length !== LOGIN_INPUT_LENGTH) {
        return;
    }

    try {
        const response = yield call(axios.post, `${API_PREFIX}/user/login`, { pin });

        // logged in
        yield call(saveLoginCredentials, pin);

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
        yield call(submitLoginForm, { customPin: pin });
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
        takeLatest(LOGIN_FORM_INPUTTED, submitLoginForm),
        takeLatest(KEY_PRESSED, submitLoginForm),
        takeLatest(SETTINGS_LOADED, autoLogin),
        takeLatest(USER_LOGGED_OUT, logoutUser)
    ]);
}

