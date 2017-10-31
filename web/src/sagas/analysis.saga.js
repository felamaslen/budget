import { select, put, call } from 'redux-saga/effects';

import { ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '../misc/const';

import { selectApiKey } from '.'
import { makeContentRequest } from './content.saga';
import { openTimedMessage } from './error.saga';
import { aAnalysisDataRefreshed } from '../actions/analysis.actions';

export const selectStateProps = state => ({
    period: state.getIn(['other', 'analysis', 'period']),
    grouping: state.getIn(['other', 'analysis', 'grouping']),
    timeIndex: state.getIn(['other', 'analysis', 'timeIndex'])
})

export function *requestAnalysisData({ payload }) {
    if (payload.wasDeep) {
        return;
    }

    const stateProps = yield select(selectStateProps);

    const { pageIndex, name, period, grouping, timeIndex } = {
        ...stateProps,
        ...payload
    };

    const apiKey = yield select(selectApiKey)

    let params = [ANALYSIS_PERIODS[period], ANALYSIS_GROUPINGS[grouping], timeIndex];

    const loadDeep = Boolean(name);
    if (loadDeep) {
        params = ['deep', name, ...params];
    }

    try {
        const response = yield call(makeContentRequest, apiKey, { pageIndex, params });

        yield put(aAnalysisDataRefreshed({ pageIndex, response, name }));
    }
    catch (err) {
        yield call(openTimedMessage, `Error loading analysis data: ${err.message}`)
    }
}

