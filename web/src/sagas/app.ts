/* eslint-disable @typescript-eslint/explicit-function-return-type */
import querystring from 'querystring';
import axios from 'axios';
import { select, takeLatest, all, call, put } from 'redux-saga/effects';

import { getFundHistoryQuery } from './funds';
import { dataRead, errorOpened, ActionTypeLogin } from '~client/actions';
import { API_PREFIX } from '~client/constants/data';
import { getApiKey } from '~client/selectors';

const getOptions = (apiKey: string): { headers: { Authorization: string } } => ({
  headers: {
    Authorization: apiKey,
  },
});

export function* fetchLegacy(apiKey: string) {
  const query = yield call(getFundHistoryQuery);

  const res = yield call(
    axios.get,
    `${API_PREFIX}/data/all?${querystring.stringify(query)}`,
    getOptions(apiKey),
  );

  return res.data.data;
}

export function* fetchNetWorth(apiKey: string) {
  const options = getOptions(apiKey);

  const res = yield all({
    categories: call(axios.get, `${API_PREFIX}/data/net-worth/categories`, options),
    subcategories: call(axios.get, `${API_PREFIX}/data/net-worth/subcategories`, options),
    entries: call(axios.get, `${API_PREFIX}/data/net-worth`, options),
  });

  return res;
}

export function* fetchData() {
  const apiKey = yield select(getApiKey);

  try {
    const { legacy, netWorth } = yield all({
      legacy: call(fetchLegacy, apiKey),
      netWorth: call(fetchNetWorth, apiKey),
    });

    const res = { ...legacy, netWorth };

    yield put(dataRead(res));
  } catch (err) {
    yield put(errorOpened(`Error loading data: ${err.message}`));
  }
}

export default function* appSaga() {
  yield takeLatest(ActionTypeLogin.ApiKeySet, fetchData);
}
