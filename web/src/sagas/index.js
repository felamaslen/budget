import { fork } from 'redux-saga/effects';

import now from '~client/sagas/now';
import app from '~client/sagas/app';
import login from '~client/sagas/login';
import crud from '~client/sagas/crud';
import analysis from '~client/sagas/analysis';
import funds from '~client/sagas/funds';

export default function *rootSaga() {
    yield fork(now);
    yield fork(app);
    yield fork(login);
    yield fork(crud);
    yield fork(analysis);
    yield fork(funds);
}
