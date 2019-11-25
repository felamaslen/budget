import {
    race, delay, take, takeEvery, call, put,
} from 'redux-saga/effects';

import { ERROR_OPENED, ERROR_CLOSED } from '~client/constants/actions/error';
import { errorClosed, errorRemoved } from '~client/actions/error';
import { ERROR_MESSAGE_DELAY, ERROR_CLOSE_TIME } from '~client/constants/error';

export function* watchManualClose(id) {
    let closedId = null;
    while (closedId !== id) {
        ({ id: closedId } = yield take(ERROR_CLOSED));
    }
}

export function* watchError({ id }) {
    yield race({
        timeout: delay(ERROR_MESSAGE_DELAY),
        manual: call(watchManualClose, id),
    });

    yield put(errorClosed(id));

    yield delay(ERROR_CLOSE_TIME);

    yield put(errorRemoved(id));
}

export default function* error() {
    yield takeEvery(ERROR_OPENED, watchError);
}
