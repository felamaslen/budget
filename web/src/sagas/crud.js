import { debounce, delay, fork, select, all, call, put } from 'redux-saga/effects';
import axios from 'axios';

import { getLocked, getApiKey } from '~client/selectors/api';
import { getCrudRequests } from '~client/selectors/list';
import { getNetWorthRequests } from '~client/selectors/overview/net-worth';
import {
    syncRequested,
    syncLocked,
    syncUnlocked,
    syncReceived,
    syncErrorOccurred
} from '~client/actions/api';
import { API_PREFIX, API_BACKOFF_TIME, TIMER_UPDATE_SERVER } from '~client/constants/data';

const withRes = (requests, res) => requests.map((request, index) => ({ ...request, res: res[index] }));

export function *updateLists(apiKey, requests) {
    if (!requests.length) {
        return [];
    }

    const res = yield call(axios.patch, `${API_PREFIX}/data/multiple`, {
        list: requests.map(({ type, id, fakeId, ...request }) => request)
    }, {
        headers: {
            Authorization: apiKey
        }
    });

    return withRes(requests, res.data.data);
}

function getUrlFromRoute(id, route) {
    const base = `${API_PREFIX}/${route}`;

    if (id) {
        return `${base}/${id}`;
    }

    return base;
}

export function *updateNetWorth(apiKey, requests) {
    if (!requests.length) {
        return [];
    }

    const res = yield all(requests.map(({ method, id, route, body: data }) => call(axios, {
        headers: {
            Authorization: apiKey
        },
        method,
        url: getUrlFromRoute(id, route),
        data
    })));

    return withRes(requests, res.map(({ data }) => data));
}

export function *updateCrud(backoffIndex = 0, unlock = false) {
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
            netWorth: call(updateNetWorth, apiKey, netWorthRequests)
        });

        yield put(syncReceived(res));
        yield call(updateCrud, 0, true);
    } catch (err) {
        yield put(syncErrorOccurred([...listRequests, ...netWorthRequests], err));

        yield delay(Math.min(300000, API_BACKOFF_TIME * (1.5 ** backoffIndex)));
        yield call(updateCrud, backoffIndex + 1, true);
    }
}

export function *updateCrudFromAction() {
    const locked = yield select(getLocked);
    if (locked) {
        return;
    }

    yield fork(updateCrud);
}

export const matchCrudAction = ({ type }) =>
    type.startsWith('@@list') ||
    type.startsWith('@@net-worth');

export default function *crudSaga() {
    yield debounce(TIMER_UPDATE_SERVER, matchCrudAction, updateCrudFromAction);
}
