import axios from 'axios';

import { API_PREFIX } from '../misc/const';

import { aLoginFormResponseReceived } from '../actions/LoginActions';

import { openTimedMessage } from './error.effects';

export function getLoginCredentials() {
    return new Promise(resolve => {
        const pin = localStorage && localStorage.getItem
            ? localStorage.getItem('pin')
            : null;

        if (pin) {
            return resolve(parseInt(pin, 10));
        }

        return resolve(null);
    });
}

export function saveLoginCredentials(dispatch, reduction, pin = null) {
    if (pin) {
        localStorage.setItem('pin', pin);
    }
    else {
        localStorage.removeItem('pin');
    }
}

export async function submitLoginForm(dispatch, reduction, pin, saveDetails = true) {
    try {
        const response = await axios.post(`${API_PREFIX}/user/login`, { pin });

        // logged in
        if (saveDetails) {
            await saveLoginCredentials(null, null, pin);
        }

        dispatch(aLoginFormResponseReceived(response));
    }
    catch (err) {
        if (err.response) {
            const message = `Login error: ${err.response.data.errorMessage}`;

            openTimedMessage(dispatch, message);
        }
        else {
            openTimedMessage(dispatch, 'Unknown error logging in');
        }

        dispatch(aLoginFormResponseReceived(null));
    }
}

