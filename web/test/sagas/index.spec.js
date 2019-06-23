import test from 'ava';
import { testSaga } from 'redux-saga-test-plan';

import rootSaga from '~client/sagas';
import appSaga from '~client/sagas/app.saga';
import loginSaga from '~client/sagas/login.saga';
import dataSyncSaga from '~client/sagas/data-sync.saga';
import contentSaga from '~client/sagas/content.saga';
import editSaga from '~client/sagas/edit.saga';
import analysisSaga from '~client/sagas/analysis.saga';
import fundsSaga from '~client/sagas/funds.saga';

test('rootSaga forking all the other sagas', t => {
    t.is(1, 1);
    testSaga(rootSaga)
        .next()
        .fork(appSaga)
        .next()
        .fork(loginSaga)
        .next()
        .fork(dataSyncSaga)
        .next()
        .fork(contentSaga)
        .next()
        .fork(editSaga)
        .next()
        .fork(analysisSaga)
        .next()
        .fork(fundsSaga)
        .next()
        .isDone();
});
