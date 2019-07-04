import { delay, put } from 'redux-saga/effects';

import { timeUpdated } from '~client/actions/now';

export default function *now() {
    while (true) {
        yield delay(1000);
        yield put(timeUpdated());
    }
}
