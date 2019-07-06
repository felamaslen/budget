import test from 'ava';
import { testSaga } from 'redux-saga-test-plan';

import rootSaga from '~client/sagas';
import now from '~client/sagas/now';
import app from '~client/sagas/app';
import error from '~client/sagas/error';
import login from '~client/sagas/login';
import crud from '~client/sagas/crud';
import analysis from '~client/sagas/analysis';
import funds from '~client/sagas/funds';

test('rootSaga forking all the other sagas', t => {
    t.is(1, 1);
    testSaga(rootSaga)
        .next()
        .fork(now)
        .next()
        .fork(app)
        .next()
        .fork(error)
        .next()
        .fork(login)
        .next()
        .fork(crud)
        .next()
        .fork(analysis)
        .next()
        .fork(funds)
        .next()
        .isDone();
});
