/* eslint-disable @typescript-eslint/explicit-function-return-type */
import axios from 'axios';
import { select, takeLatest, put, call } from 'redux-saga/effects';

import {
  ActionTypeAnalysis,
  analysisReceived,
  blockReceived,
  ActionAnalysisBlockRequested,
  errorOpened,
} from '~client/actions';

import { API_PREFIX } from '~client/constants/data';
import {
  getApiKey,
  getAnalysisLoadingDeep as getLoadingDeep,
  getAnalysisPeriod,
  getAnalysisGrouping as getGrouping,
  getAnalysisPage as getPage,
} from '~client/selectors';

export function* onRequest() {
  const period = yield select(getAnalysisPeriod);
  const grouping = yield select(getGrouping);
  const page = yield select(getPage);

  const apiKey = yield select(getApiKey);

  try {
    const res = yield call(axios.get, `${API_PREFIX}/data/analysis/${period}/${grouping}/${page}`, {
      headers: { Authorization: apiKey },
    });

    yield put(analysisReceived(res.data));
  } catch (err) {
    yield put(errorOpened(`Error loading analysis data: ${err.message}`));
    yield put(analysisReceived(undefined, err));
  }
}

export function* onBlockRequest({ name }: ActionAnalysisBlockRequested) {
  const loading = yield select(getLoadingDeep);
  if (!loading) {
    return;
  }

  const period = yield select(getAnalysisPeriod);
  const grouping = yield select(getGrouping);
  const page = yield select(getPage);

  const apiKey = yield select(getApiKey);

  try {
    const res = yield call(
      axios.get,
      `${API_PREFIX}/data/analysis/deep/${name}/${period}/${grouping}/${page}`,
      {
        headers: { Authorization: apiKey },
      },
    );

    yield put(blockReceived(res.data));
  } catch (err) {
    yield put(errorOpened(`Error loading analysis block data: ${err.message}`));
    yield put(blockReceived(undefined, err));
  }
}

export default function* analysisSaga() {
  yield takeLatest(ActionTypeAnalysis.Requested, onRequest);
  yield takeLatest(ActionTypeAnalysis.BlockRequested, onBlockRequest);
}
