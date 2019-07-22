import test from 'ava';
import { testSaga } from 'redux-saga-test-plan';
import { delay, call } from 'redux-saga/effects';

import error, { watchManualClose, watchError } from '~client/sagas/error';
import { ERROR_OPENED, ERROR_CLOSED } from '~client/constants/actions/error';
import { errorOpened, errorClosed, errorRemoved } from '~client/actions/error';
import { ERROR_MESSAGE_DELAY, ERROR_CLOSE_TIME } from '~client/constants/error';

test('watchManualClose waits for a particular error to be manually closed', t => {
    t.is(1, 1);

    const id = 'my-error-id';

    testSaga(watchManualClose, id)
        .next()
        .take(ERROR_CLOSED)
        .next(errorClosed('some-other-id'))
        .take(ERROR_CLOSED)
        .next(errorClosed(id))
        .isDone();
});

test('watchError hides and removes messages after a timer, or manual close', t => {
    t.is(1, 1);

    const errorAction = errorOpened('foo message');

    testSaga(watchError, errorAction)
        .next()
        .race({
            timeout: delay(ERROR_MESSAGE_DELAY),
            manual: call(watchManualClose, errorAction.id)
        })
        .next()
        .put(errorClosed(errorAction.id))
        .next()
        .delay(ERROR_CLOSE_TIME)
        .next()
        .put(errorRemoved(errorAction.id))
        .next()
        .isDone();
});

test('error forks watchError', t => {
    t.is(1, 1);
    testSaga(error)
        .next()
        .takeEvery(ERROR_OPENED, watchError)
        .next()
        .isDone();
});
