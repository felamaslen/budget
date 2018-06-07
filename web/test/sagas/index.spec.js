import { testSaga } from 'redux-saga-test-plan';

import rootSaga from '../../src/sagas';
import appSaga from '../../src/sagas/app.saga';
import loginSaga from '../../src/sagas/login.saga';
import dataSyncSaga from '../../src/sagas/data-sync.saga';
import contentSaga from '../../src/sagas/content.saga';
import editSaga from '../../src/sagas/edit.saga';
import analysisSaga from '../../src/sagas/analysis.saga';
import fundsSaga from '../../src/sagas/funds.saga';

describe('rootSaga', () => {
    it('should fork all the other sagas', () => {
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
});

