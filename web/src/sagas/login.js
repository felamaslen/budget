import axios from 'axios';
import { fork, takeLatest, put, call } from 'redux-saga/effects';
import { LOGGED_OUT, LOGIN_REQUESTED } from '~client/constants/actions/login';
import { API_PREFIX } from '~client/constants/data';
import { loginRequested, loggedIn, loggedOut, loginErrorOccurred } from '~client/actions/login';
import { errorOpened } from '~client/actions/error';

export function *onLoginAttempt({ pin }) {
    try {
        const res = yield call(axios.post, `${API_PREFIX}/user/login`, { pin });

        try {
            yield call([localStorage, 'setItem'], 'pin', pin);
        } catch {
            // do nothing
        }

        yield put(loggedIn(res.data));
    } catch (err) {
        if (err.response) {
            const message = `Login error: ${err.response.data.err}`;

            yield put(errorOpened(message));
        }

        yield put(loginErrorOccurred(err));
        yield put(loggedOut());
    }
}

export function *onLogout() {
    try {
        yield call([localStorage, 'removeItem'], 'pin');
    } catch {
        // do nothing
    }
}

export function *autoLogin() {
    try {
        const pin = yield call([localStorage, 'getItem'], 'pin');

        if (pin && !isNaN(Number(pin))) {
            yield call(onLoginAttempt, loginRequested(Number(pin)));
        } else {
            yield put(loggedOut());
        }
    } catch {
        // do nothing
    }
}

export default function *loginSaga() {
    yield takeLatest(LOGIN_REQUESTED, onLoginAttempt);
    yield takeLatest(LOGGED_OUT, onLogout);

    yield fork(autoLogin);
}
