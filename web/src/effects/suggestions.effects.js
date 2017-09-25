import { List as list } from 'immutable';
import axios from 'axios';

import { API_PREFIX, MAX_SUGGESTIONS } from '../misc/const';

import { aSuggestionsReceived } from '../actions/EditActions';

export async function requestSuggestions(dispatch, { apiKey, page, item, value, reqId }) {
    const url = `${API_PREFIX}/data/search/${page}/${item}/${value}/${MAX_SUGGESTIONS}`;

    try {
        const response = await axios.get(url, { headers: { 'Authorization': apiKey } });

        const items = list(response.data.data.list);

        dispatch(aSuggestionsReceived({ items, reqId }));
    }
    catch (err) {
        console.warn('Error loading search suggestions');
    }
}

