import { List as list } from 'immutable';
import { delay, fork, select, put } from 'redux-saga/effects';
import { TIMER_UPDATE_SERVER } from '~client/constants/data';
import { aSettingsLoaded, aServerUpdated } from '~client/actions/app.actions';
import { getRawRequestList } from '~client/selectors/app';

export function *loopDataSync() {
    let lastRequestList = list.of();

    while (true) {
        yield delay(TIMER_UPDATE_SERVER);

        const requestList = yield select(getRawRequestList);

        if (!requestList.equals(lastRequestList) && requestList.size) {
            lastRequestList = requestList;

            yield put(aServerUpdated());
        }
    }
}

export default function *dataSyncSaga() {
    yield put(aSettingsLoaded());

    yield fork(loopDataSync);
}

