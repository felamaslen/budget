import axios from 'axios';
import querystring from 'querystring';

import { API_PREFIX, PAGES } from '../misc/const';

export function requestContent({ apiKey, pageIndex, params, query }) {
    const path = ['data', PAGES[pageIndex]].concat(params || []);

    const queryObj = (query || []).reduce((items, item) => {
        items[item.name] = item.value;

        return items;
    }, {});

    const url = [
        API_PREFIX,
        path.join('/'),
        `?${querystring.stringify(queryObj)}`
    ].join('/');

    return axios.get(url, { headers: { 'Authorization': apiKey } });
}

