import axios from 'axios';

import { API_PREFIX, MAX_SUGGESTIONS } from '../misc/const';

export function requestSuggestions({ apiKey, page, item, value }) {
    const url = `${API_PREFIX}/data/search/${page}/${item}/${value}/${MAX_SUGGESTIONS}`;

    return axios.get(url, { headers: { 'Authorization': apiKey } });
}

