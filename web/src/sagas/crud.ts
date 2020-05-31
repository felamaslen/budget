/* eslint-disable @typescript-eslint/explicit-function-return-type */
import axios, { AxiosRequestConfig, AxiosPromise, AxiosResponse } from 'axios';
import { debounce, delay, select, takeLatest, all, call, put } from 'redux-saga/effects';

import {
  ListActionType,
  ActionTypeNetWorth,
  ActionTypeApi,
  ActionApiSyncAttempted,
  syncRequested,
  syncLocked,
  syncAttempted,
  syncUnlocked,
  syncReceived,
  syncErrorOccurred,
} from '~client/actions';
import { API_PREFIX, API_BACKOFF_TIME, TIMER_UPDATE_SERVER } from '~client/constants/data';
import { getLocked, getApiKey, getCrudRequests, getNetWorthRequests } from '~client/selectors';
import { Request } from '~client/types';

const withRes = <R>(requests: Request[], res: R[]) =>
  requests.map((request, index) => ({ ...request, res: res[index] }));

export function* updateLists(apiKey: string, requests: Request[]) {
  if (!requests.length) {
    return [];
  }

  const res = yield call(
    axios.patch,
    `${API_PREFIX}/data/multiple`,
    {
      list: requests.map(({ type, id, fakeId, ...request }) => request),
    },
    {
      headers: {
        Authorization: apiKey,
      },
    },
  );

  return withRes(requests, res.data.data);
}

function getUrlFromRoute(route: string, id?: string): string {
  const base = `${API_PREFIX}/${route}`;
  return id ? `${base}/${id}` : base;
}

export function* updateNetWorth(apiKey: string, requests: Request[]) {
  if (!requests.length) {
    return [];
  }

  const res = yield all(
    requests.map(({ method, id, route, body: data }) =>
      call<(config: AxiosRequestConfig) => AxiosPromise<object>>(axios, {
        url: getUrlFromRoute(route, id),
        headers: {
          Authorization: apiKey,
        },
        method,
        data,
      }),
    ),
  );

  return withRes(
    requests,
    res.map(({ data }: AxiosResponse) => data),
  );
}

export function* updateCrud({ backoffIndex, unlock }: ActionApiSyncAttempted) {
  const listRequests = yield select(getCrudRequests);
  const netWorthRequests = yield select(getNetWorthRequests);
  if (listRequests.length + netWorthRequests.length === 0) {
    if (unlock) {
      yield put(syncUnlocked());
    }

    return;
  }

  yield put(syncLocked());
  const apiKey = yield select(getApiKey);

  try {
    yield put(syncRequested());

    const res = yield all({
      list: call(updateLists, apiKey, listRequests),
      netWorth: call(updateNetWorth, apiKey, netWorthRequests),
    });

    yield put(syncReceived(res));
    yield put(syncAttempted(0, true));
  } catch (err) {
    yield put(syncErrorOccurred([...listRequests, ...netWorthRequests], err));

    yield delay(Math.min(300000, API_BACKOFF_TIME * 1.5 ** backoffIndex));
    yield put(syncAttempted(backoffIndex + 1, true));
  }
}

export function* updateCrudFromAction() {
  const locked = yield select(getLocked);
  if (locked) {
    return;
  }

  yield put(syncAttempted());
}

export default function* crudSaga() {
  yield debounce(
    TIMER_UPDATE_SERVER,
    [
      ListActionType.Created,
      ListActionType.Updated,
      ListActionType.Deleted,
      ActionTypeNetWorth.CategoryCreated,
      ActionTypeNetWorth.CategoryUpdated,
      ActionTypeNetWorth.CategoryDeleted,
      ActionTypeNetWorth.SubcategoryCreated,
      ActionTypeNetWorth.SubcategoryUpdated,
      ActionTypeNetWorth.SubcategoryDeleted,
      ActionTypeNetWorth.EntryCreated,
      ActionTypeNetWorth.EntryUpdated,
      ActionTypeNetWorth.EntryDeleted,
    ],
    updateCrudFromAction,
  );

  yield takeLatest(ActionTypeApi.SyncAttempted, updateCrud);
}
