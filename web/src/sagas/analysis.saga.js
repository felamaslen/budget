import { select, put } from 'redux-saga/effects';

import { ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '../misc/const';

import { makeContentRequest } from './content.saga';
import { openTimedMessage } from './error.saga';
import { aAnalysisDataRefreshed } from '../actions/analysis.actions';

export function *requestAnalysisData({ payload }) {
    const stateProps = yield select(state => ({
        period: state.getIn(['other', 'analysis', 'period']),
        grouping: state.getIn(['other', 'analysis', 'grouping']),
        timeIndex: state.getIn(['other', 'analysis', 'timeIndex'])
    }));

    const { pageIndex, name, period, grouping, timeIndex, wasDeep } = {
        ...stateProps,
        ...payload
    };

    if (wasDeep) {
        return;
    }

    const apiKey = yield select(state => state.getIn(['user', 'apiKey']));

    let params = [ANALYSIS_PERIODS[period], ANALYSIS_GROUPINGS[grouping], timeIndex];

    const loadDeep = Boolean(name);
    if (loadDeep) {
        params = ['deep', name, ...params];
    }

    try {
        const response = yield makeContentRequest(apiKey, { pageIndex, params });

        yield put(aAnalysisDataRefreshed({ pageIndex, response, name }));
    }
    catch (err) {
        console.error(err.stack);

        yield openTimedMessage(`Error loading analysis data: ${err.message}`);
    }
}

