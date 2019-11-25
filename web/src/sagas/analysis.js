import {
    select, takeLatest, put, call,
} from 'redux-saga/effects';
import axios from 'axios';

import { received, blockReceived } from '~client/actions/analysis';
import { errorOpened } from '~client/actions/error';
import {
    getLoadingDeep,
    getPeriod,
    getGrouping,
    getPage,
} from '~client/selectors/analysis';
import { getApiKey } from '~client/selectors/api';
import { API_PREFIX } from '~client/constants/data';
import { ANALYSIS_REQUESTED, ANALYSIS_BLOCK_REQUESTED } from '~client/constants/actions/analysis';

export function* onRequest() {
    const period = yield select(getPeriod);
    const grouping = yield select(getGrouping);
    const page = yield select(getPage);

    const apiKey = yield select(getApiKey);

    try {
        const res = yield call(axios.get, `${API_PREFIX}/data/analysis/${period}/${grouping}/${page}`, {
            headers: { Authorization: apiKey },
        });

        yield put(received(res.data));
    } catch (err) {
        yield put(errorOpened(`Error loading analysis data: ${err.message}`));
        yield put(received(null, err));
    }
}

export function* onBlockRequest({ name }) {
    const loading = yield select(getLoadingDeep);
    if (!loading) {
        return;
    }

    const period = yield select(getPeriod);
    const grouping = yield select(getGrouping);
    const page = yield select(getPage);

    const apiKey = yield select(getApiKey);

    try {
        const res = yield call(axios.get, `${API_PREFIX}/data/analysis/deep/${name}/${period}/${grouping}/${page}`, {
            headers: { Authorization: apiKey },
        });

        yield put(blockReceived(res.data));
    } catch (err) {
        yield put(errorOpened(`Error loading analysis data: ${err.message}`));
        yield put(blockReceived(null, err));
    }
}

export default function* analysisSaga() {
    yield takeLatest(ANALYSIS_REQUESTED, onRequest);
    yield takeLatest(ANALYSIS_BLOCK_REQUESTED, onBlockRequest);
}
