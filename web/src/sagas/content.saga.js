import axios from 'axios';
import querystring from 'querystring';
import { all, select, takeLatest, call, put } from 'redux-saga/effects';
import { CONTENT_REQUESTED } from '../constants/actions';
import { API_PREFIX } from '../constants/data';
import { ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '../constants/analysis';
import { getPeriodMatch } from '../helpers/data';
import { selectApiKey } from '.';
import { openTimedMessage } from './error.saga';
import { aContentLoaded } from '../actions/content.actions';

export function makeContentRequest(apiKey, { page, params, query }) {
    const path = ['data', page, ...params || []];

    const queryObj = query || {};

    const url = [
        API_PREFIX,
        path.join('/'),
        `?${querystring.stringify(queryObj)}`
    ].join('/');

    return [url, { headers: { Authorization: apiKey } }];
}

export const getContentParamsAnalysis = state => ({
    periodKey: state.getIn(['other', 'analysis', 'period']),
    groupingKey: state.getIn(['other', 'analysis', 'grouping']),
    timeIndex: state.getIn(['other', 'analysis', 'timeIndex'])
});

export const getLoadedStatus = (state, page) => Boolean(state.getIn(['pagesLoaded', page]));

export function *requestContent({ page }) {
    let loaded = yield select(getLoadedStatus, page);
    let params = [];
    let query = {};

    if (page === 'analysis') {
        loaded = false;

        const { periodKey, groupingKey, timeIndex } = yield select(getContentParamsAnalysis);

        params = [
            ANALYSIS_PERIODS[periodKey],
            ANALYSIS_GROUPINGS[groupingKey],
            timeIndex
        ];
    }
    else if (page === 'funds') {
        const { period, length } = getPeriodMatch();

        query = { history: 'true', period, length };
    }

    if (loaded) {
        return;
    }

    const apiKey = yield select(selectApiKey);

    try {
        const response = yield call(axios.get, ...makeContentRequest(apiKey, { page, params, query }));

        yield put(aContentLoaded({ page, response }));
    }
    catch (err) {
        if (err.response) {
            yield call(openTimedMessage, 'An error occurred loading content');
        }

        yield put(aContentLoaded({ page, response: null }));
    }
}

export default function *contentSaga() {
    yield all([
        takeLatest(CONTENT_REQUESTED, requestContent)
    ]);
}

