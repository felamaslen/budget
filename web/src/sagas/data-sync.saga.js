import { List as list } from 'immutable';
import { eventChannel } from 'redux-saga';
import { fork, select, take, call, put } from 'redux-saga/effects';
import { TIMER_UPDATE_SERVER } from '../constants/data';
import { SERVER_UPDATED } from '../constants/actions';
import { aSettingsLoaded, aServerUpdated } from '../actions/app.actions';

export const selectRequestList = state =>
    state.getIn(['edit', 'requestList']);

function dataSyncEventChannel() {
    return eventChannel(emitter => {
        const dataSync = setInterval(() => emitter(aServerUpdated()), TIMER_UPDATE_SERVER);

        return () => {
            clearInterval(dataSync);
        };
    });
}

export function *loopDataSync() {
    const channel = yield call(dataSyncEventChannel);

    let lastRequestList = list.of();

    while (true) {
        const action = yield take(channel);

        if (action.type === SERVER_UPDATED) {
            const requestList = yield select(selectRequestList);

            if (!requestList.equals(lastRequestList) && requestList.size) {
                lastRequestList = requestList;

                yield put(action);
            }
        }
        else {
            yield put(action);
        }
    }
}

export default function *dataSyncSaga() {
    yield put(aSettingsLoaded());

    yield fork(loopDataSync);
}

