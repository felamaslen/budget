/**
 * Define side effects here (e.g. API calls)
 */

import axios from 'axios';
import querystring from 'querystring';

import { PAGES, API_PREFIX } from '../misc/const';

import { aErrorOpened } from '../actions/ErrorActions';

import { aServerAddReceived } from '../actions/AppActions';
import { aFundsPeriodLoaded } from '../actions/GraphActions';
import { aStocksListReceived, aStocksPricesReceived } from '../actions/StocksListActions';

export function updateServerData({ apiKey, requestList }) {
    return axios.patch(
        `${API_PREFIX}/data/multiple`,
        { list: requestList },
        { headers: { 'Authorization': apiKey } }
    );
}

export async function addServerData(dispatch, req) {
    try {
        const response = await axios.post(`${API_PREFIX}/data/${PAGES[req.pageIndex]}`, req.item, {
            headers: { 'Authorization': req.apiKey }
        });

        return dispatch(aServerAddReceived({
            response,
            item: req.fields,
            pageIndex: req.pageIndex
        }));
    }
    catch (err) {
        return dispatch(aErrorOpened('Error adding data to server!'));
    }
}

export async function requestFundPeriodData(dispatch, req) {
    const query = querystring.stringify({
        period: req.period,
        length: req.length,
        history: true
    });

    try {
        const response = await axios.get(`${API_PREFIX}/data/funds?${query}`, {
            headers: { 'Authorization': req.apiKey }
        });

        const period = `${req.period}${req.length}`;
        const data = response.data.data;

        return dispatch(aFundsPeriodLoaded({
            reloadPagePrices: req.reloadPagePrices,
            period,
            data
        }));
    }
    catch (err) {
        return dispatch(aErrorOpened('Error loading fund data'));
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

