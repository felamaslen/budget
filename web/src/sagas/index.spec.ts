import { testSaga } from 'redux-saga-test-plan';

import rootSaga from '~client/sagas';
import analysis from '~client/sagas/analysis';
import app from '~client/sagas/app';
import crud from '~client/sagas/crud';
import funds from '~client/sagas/funds';
import login from '~client/sagas/login';

describe('Root saga', () => {
  it('should fork all the other sagas', () => {
    expect.assertions(0);
    testSaga(rootSaga)
      .next()
      .fork(app)
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
});
