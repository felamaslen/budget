import { all, select, takeEvery, put, call } from 'redux-saga/effects';
import axios from 'axios';

import { ANALYSIS_BLOCK_CLICKED, ANALYSIS_OPTION_CHANGED } from '~client/constants/actions';
import { ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '~client/constants/analysis';

import { makeContentRequest } from './content.saga';
import { openTimedMessage } from './error.saga';
import { aAnalysisDataRefreshed } from '../actions/analysis.actions';
import { getApiKey } from '~client/selectors/app';
import { requestProps } from '~client/selectors/analysis';

export function *requestAnalysisData({ wasDeep, ...payload }) {
    if (wasDeep) {
        return;
    }

    const stateProps = yield select(requestProps);

    const { loading, name, period, grouping, timeIndex } = { ...stateProps, ...payload };

    if (!loading) {
        return;
    }

    const apiKey = yield select(getApiKey);

    let params = [ANALYSIS_PERIODS[period], ANALYSIS_GROUPINGS[grouping], timeIndex];

    if (name) {
        params = ['deep', name, ...params];
    }

    try {
        const response = yield call(axios.get, ...makeContentRequest(apiKey, { page: 'analysis', params }));

        yield put(aAnalysisDataRefreshed({ response, name }));
    }
    catch (err) {
        yield call(openTimedMessage, `Error loading analysis data: ${err.message}`);
    }
}

export default function *analysisSaga() {
    yield all([
        takeEvery(ANALYSIS_BLOCK_CLICKED, requestAnalysisData),
        takeEvery(ANALYSIS_OPTION_CHANGED, requestAnalysisData)
    ]);
}

