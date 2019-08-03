import test from 'ava';
import { testSaga } from 'redux-saga-test-plan';

import rootSaga from '~client/sagas';

import io from '~client/sagas/io';
import now from '~client/sagas/now';
import app from '~client/sagas/app';
import error from '~client/sagas/error';
import login from '~client/sagas/login';
import crud from '~client/sagas/crud';
import analysis from '~client/sagas/analysis';
import funds from '~client/sagas/funds';
import suggestions from '~client/sagas/suggestions';

test('rootSaga forking all the other sagas', t => {
    const ioServer = { isIoServer: true };

    testSaga(rootSaga)
        .next()
        .call(io)
        .next(ioServer)
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
        .fork(funds, ioServer)
        .next()
        .fork(suggestions)
        .next()
        .isDone();

    t.pass();
});
