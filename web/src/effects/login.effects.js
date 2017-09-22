import axios from 'axios';

import { API_PREFIX } from '../misc/const';

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

export function saveLoginCredentials(pin) {
    return new Promise(resolve => {
        if (!pin) {
            return resolve(localStorage.removeItem('pin'));
        }

        return resolve(localStorage.setItem('pin', pin));
    });
}

export function submitLoginForm(pin) {
    return axios.post(`${API_PREFIX}/user/login`, { pin });
}

