/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { eventChannel, Channel } from 'redux-saga';
import { select, fork, take, takeLatest, all, call, put } from 'redux-saga/effects';
import { debounce } from 'throttle-debounce';
import axios from 'axios';
import querystring from 'querystring';

import { getFundHistoryQuery } from '~client/sagas/funds';

import { windowResized } from '~client/actions/app';
import { dataRead } from '~client/actions/api';
import { errorOpened } from '~client/actions/error';

import { getApiKey } from '~client/selectors/api';

import { LOGGED_IN } from '~client/constants/actions/login';
import { API_PREFIX } from '~client/constants/data';

export type ResizeEvent = {
  type: string;
  size: number;
};

export const windowResizeEventChannel = (): Channel<ResizeEvent> =>
  eventChannel<ResizeEvent>(emit => {
    const resizeHandler = debounce(50, () => emit(windowResized(window.innerWidth)));

    window.addEventListener('resize', resizeHandler);

    return (): void => window.removeEventListener('resize', resizeHandler);
  }) as Channel<ResizeEvent>;

export function* watchEventEmitter(channelCreator: () => Channel<ResizeEvent>) {
  const channel: Channel<ResizeEvent> = yield call(channelCreator);

  while (true) {
    const action = yield take<ResizeEvent>(channel);

    yield put(action);
  }
}

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
  yield fork(watchEventEmitter, windowResizeEventChannel);

  yield takeLatest(LOGGED_IN, fetchData);
}
