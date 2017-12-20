import { all, select, takeEvery, put, call } from 'redux-saga/effects';
import axios from 'axios';

import { ANALYSIS_BLOCK_CLICKED, ANALYSIS_OPTION_CHANGED } from '../constants/actions';
import { ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '../misc/const';

import { selectApiKey } from '.';
import { makeContentRequest } from './content.saga';
import { openTimedMessage } from './error.saga';
import { aAnalysisDataRefreshed } from '../actions/analysis.actions';

export const selectStateProps = state => ({
    period: state.getIn(['other', 'analysis', 'period']),
    grouping: state.getIn(['other', 'analysis', 'grouping']),
    timeIndex: state.getIn(['other', 'analysis', 'timeIndex'])
});

export function *requestAnalysisData({ wasDeep, ...payload }) {
    if (wasDeep) {
        return;
    }

    const stateProps = yield select(selectStateProps);

    const { name, period, grouping, timeIndex } = { ...stateProps, ...payload };

    const apiKey = yield select(selectApiKey);

    let params = [ANALYSIS_PERIODS[period], ANALYSIS_GROUPINGS[grouping], timeIndex];

    const loadDeep = Boolean(name);
    if (loadDeep) {
        params = ['deep', name, ...params];
    }

    try {
        const response = yield call(axios.get, ...makeContentRequest(apiKey, { params }));

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

