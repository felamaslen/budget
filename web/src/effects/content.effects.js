import axios from 'axios';
import querystring from 'querystring';

import { API_PREFIX, PAGES } from '../misc/const';

export function requestContent({ apiKey, pageIndex, params, query }) {
    const path = ['data', PAGES[pageIndex]].concat(params || []);

    const queryObj = query || {};

    const url = [
        API_PREFIX,
        path.join('/'),
        `?${querystring.stringify(queryObj)}`
    ].join('/');

    return axios.get(url, { headers: { 'Authorization': apiKey } });
}

export function requestFundPeriodData({ apiKey, period, length }) {
    const query = querystring.stringify({ period, length, history: true });

    return axios.get(`${API_PREFIX}/data/funds?${query}`, {
        headers: { 'Authorization': apiKey }
    });
}

