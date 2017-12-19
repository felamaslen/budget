import { fork } from 'redux-saga/effects';

import appSaga from './app.saga';
import loginSaga from './login.saga';
import dataSyncSaga from './data-sync.saga';
import contentSaga from './content.saga';
import editSaga from './edit.saga';
import analysisSaga from './analysis.saga';
import fundsSaga from './funds.saga';

export const selectApiKey = state => state.getIn(['user', 'apiKey']);

export default function *rootSaga() {
    yield fork(appSaga);
    yield fork(loginSaga);
    yield fork(dataSyncSaga);
    yield fork(contentSaga);
    yield fork(editSaga);
    yield fork(analysisSaga);
    yield fork(fundsSaga);
}

