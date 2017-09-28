/**
 * Define side effects here (e.g. API calls)
 */

import { Map as map } from 'immutable';
import axios from 'axios';
import querystring from 'querystring';

import {
    PAGES, API_PREFIX, LIST_COLS_PAGES,
    ERROR_LEVEL_WARN
} from '../misc/const';
import { ERROR_MSG_BAD_DATA } from '../misc/config';

import { aServerUpdateReceived, aServerAddReceived } from '../actions/AppActions';
import { aLoginFormSubmitted, aLoginFormResponseReceived } from '../actions/LoginActions';
import { aListItemAdded } from '../actions/EditActions';
import { aStocksListReceived, aStocksPricesReceived } from '../actions/StocksListActions';

import { getInvalidInsertDataKeys, stringifyFields } from '../reducers/EditReducer';

import { openTimedMessage } from './error.effects';
import { getLoginCredentials, submitLoginForm } from './login.effects';

export async function loadSettings(dispatch) {
    if (!localStorage || !localStorage.getItem) {
        console.warn('localStorage not available - settings not saved');

        return;
    }

    const pin = await getLoginCredentials();

    if (pin) {
        dispatch(aLoginFormSubmitted(pin));

        submitLoginForm(dispatch, null, pin, false);
    }
    else {
        dispatch(aLoginFormResponseReceived(null));
    }
}

export async function updateServerData(dispatch, reduction) {
    const apiKey = reduction.getIn(['user', 'apiKey']);
    const requestList = reduction.getIn(['edit', 'requestList'])
        .map(item => item.get('req'));

    try {
        const response = await axios.patch(`${API_PREFIX}/data/multiple`, {
            list: requestList
        }, {
            headers: { 'Authorization': apiKey }
        });

        dispatch(aServerUpdateReceived(response));
    }
    catch (err) {
        openTimedMessage(dispatch, 'Error updating data on server!');

        dispatch(aServerUpdateReceived(null));
    }
}

export async function addServerData(dispatch, reduction, { pageIndex, sending }) {
    if (sending) {
        return;
    }

    if (reduction.get('loadingApi')) {
        openTimedMessage(
            dispatch, 'Wait until the previous request has finished', ERROR_LEVEL_WARN
        );

        return;
    }

    const apiKey = reduction.getIn(['user', 'apiKey']);

    // validate items
    const active = reduction.getIn(['edit', 'active']);
    let activeItem = null;
    let activeValue = null;
    if (active && active.get('row') === -1) {
        activeItem = active.get('item');
        activeValue = active.get('value');
    }

    const items = reduction
        .getIn(['edit', 'add'])
        .map((value, key) => ({
            item: LIST_COLS_PAGES[pageIndex][key],
            value
        }));

    const fields = items.map(({ item, value }) => {
        if (item === activeItem) {
            return map({ item, value: activeValue });
        }

        return map({ item, value });
    });

    const invalidKeys = getInvalidInsertDataKeys(fields);
    const valid = invalidKeys.size === 0;

    if (!valid) {
        openTimedMessage(dispatch, ERROR_MSG_BAD_DATA, ERROR_LEVEL_WARN);

        return;
    }

    // data is validated
    const item = stringifyFields(fields);

    dispatch(aListItemAdded({ pageIndex, sending: true }));

    try {
        const response = await axios.post(`${API_PREFIX}/data/${PAGES[pageIndex]}`, item, {
            headers: { 'Authorization': apiKey }
        });

        dispatch(aServerAddReceived({ response, fields, pageIndex }));
    }
    catch (err) {
        openTimedMessage(dispatch, 'Error adding data to server!');
    }
}

export async function requestStocksList(dispatch, apiKey) {
    try {
        const response = await axios.get(`${API_PREFIX}/data/stocks`, {
            headers: { 'Authorization': apiKey }
        });

        return dispatch(aStocksListReceived(response.data.data));
    }
    catch (err) {
        return dispatch(aStocksListReceived(null));
    }
}

// TODO
export async function requestStockPrices(dispatch, req) {
    const promises = req.symbols.map(symbol => {
        const url = 'https://www.alphavantage.co/query';
        const query = {
            function: 'TIME_SERIES_DAILY',
            symbol,
            apikey: req.apiKey,
            datatype: 'json'
        };

        const requestUrl = `${url}?${querystring.stringify(query)}`;

        return axios.get(requestUrl);
    });

    try {
        const responses = await Promise.all(promises);

        const data = responses.map(response => response.data);

        return dispatch(aStocksPricesReceived(data));
    }
    catch (err) {
        console.error('Error fetching stock prices', err.message);

        return dispatch(aStocksPricesReceived(null));
    }
}

