import { debounce, select, call, put } from 'redux-saga/effects';
import axios from 'axios';

import { getApiKey } from '~client/selectors/api';
import { getCrudRequests } from '~client/selectors/list';
import { syncRequested, syncReceived, syncErrorOccurred } from '~client/actions/api';
import {
    LIST_ITEM_CREATED,
    LIST_ITEM_UPDATED,
    LIST_ITEM_DELETED
} from '~client/constants/actions/list';
import { API_PREFIX, TIMER_UPDATE_SERVER } from '~client/constants/data';

export function *updateCrud() {
    const requests = yield select(getCrudRequests);
    const apiKey = yield select(getApiKey);

    try {
        yield put(syncRequested());

        const res = yield call(axios.patch, `${API_PREFIX}/data/multiple`, {
            list: requests.map(({ type, id, fakeId, ...request }) => request)
        }, {
            headers: {
                Authorization: apiKey
            }
        });

        yield put(syncReceived(requests, res.data.data));
    } catch (err) {
        yield put(syncErrorOccurred(requests, err));
    }
}

export default function *crudSaga() {
    yield debounce(TIMER_UPDATE_SERVER, [
        LIST_ITEM_CREATED,
        LIST_ITEM_UPDATED,
        LIST_ITEM_DELETED
    ], updateCrud);
}
