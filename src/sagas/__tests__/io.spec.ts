import { testSaga } from 'redux-saga-test-plan';
import { createMockTask } from '@redux-saga/testing-utils';

import ioSaga, { createSocket } from '~/sagas/io';
import { onLoginToggle } from '~/sagas/login';
import { getToken } from '~/selectors/login';

test('ioSaga creates a socket when logged in', () => {
  const task = createMockTask();

  testSaga(ioSaga)
    .next()
    .call(onLoginToggle)
    .next(false)
    .call(onLoginToggle)
    .next(true)
    .select(getToken)
    .next('my-token')
    .fork(createSocket, 'my-token')
    .next(task)
    .call(onLoginToggle)
    .next(false)
    .cancel(task)
    .next()
    .call(onLoginToggle)
    .next(false);
});
