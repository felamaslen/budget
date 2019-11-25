import { fork } from 'redux-saga/effects';

import now from '~client/sagas/now';
import app from '~client/sagas/app';
import error from '~client/sagas/error';
import login from '~client/sagas/login';
import crud from '~client/sagas/crud';
import analysis from '~client/sagas/analysis';
import funds from '~client/sagas/funds';
import suggestions from '~client/sagas/suggestions';

export default function* rootSaga() {
    yield fork(now);
    yield fork(app);
    yield fork(error);
    yield fork(login);
    yield fork(crud);
    yield fork(analysis);
    yield fork(funds);
    yield fork(suggestions);
}
