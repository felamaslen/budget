import axios from 'axios';
import querystring from 'querystring';

import {
    API_PREFIX, PAGES, ANALYSIS_PERIODS, ANALYSIS_GROUPINGS
} from '../misc/const';
import { getPeriodMatch } from '../misc/data';

import { aContentLoaded } from '../actions/ContentActions';
import { aAnalysisDataRefreshed } from '../actions/AnalysisActions';
import { aFundsGraphPeriodReceived } from '../actions/GraphActions';

import { openTimedMessage } from './error.effects';

function makeContentRequest(apiKey, { pageIndex, params, query }) {
    const path = ['data', PAGES[pageIndex]].concat(params || []);

    const queryObj = query || {};

    const url = [
        API_PREFIX,
        path.join('/'),
        `?${querystring.stringify(queryObj)}`
    ].join('/');

    return axios.get(url, { headers: { 'Authorization': apiKey } });
}

export async function requestContent(dispatch, reduction, { pageIndex, params, query }) {
    const apiKey = reduction.getIn(['user', 'apiKey']);

    try {
        const response = await makeContentRequest(apiKey, { pageIndex, params, query });

        dispatch(aContentLoaded({ pageIndex, response }));
    }
    catch (err) {
        openTimedMessage(dispatch, 'An error occurred loading content');

        dispatch(aContentLoaded({ pageIndex, response: null }));
    }
}

export async function requestFundPeriodData(dispatch, { apiKey, shortPeriod, reloadPagePrices }) {
    const { period, length } = getPeriodMatch(shortPeriod);
    const query = querystring.stringify({ period, length, history: true });

    try {
        const response = await axios.get(`${API_PREFIX}/data/funds?${query}`, {
            headers: { 'Authorization': apiKey }
        });

        const data = response.data.data;

        dispatch(aFundsGraphPeriodReceived, { reloadPagePrices, shortPeriod, data });
    }
    catch (err) {
        openTimedMessage(dispatch, 'Error loading fund data');
    }
}

export async function requestAnalysisData(dispatch, reduction, {
    pageIndex, period, grouping, timeIndex, loadDeep, name
}) {
    const apiKey = reduction.getIn(['user', 'apiKey']);
    let params = [ANALYSIS_PERIODS[period], ANALYSIS_GROUPINGS[grouping], timeIndex];

    if (loadDeep) {
        params = ['deep', name].concat(params);
    }

    try {
        const response = await makeContentRequest(apiKey, { pageIndex, params });

        dispatch(aAnalysisDataRefreshed({ response, loadDeep, name }));
    }
    catch (err) {
        console.error(err.stack);
        openTimedMessage(dispatch, `Error loading analysis data: ${err.message}`);
    }
}

