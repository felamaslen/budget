import test from 'ava';
import { testSaga } from 'redux-saga-test-plan';

import now from '~client/sagas/now';
import { timeUpdated } from '~client/actions/now';

test('now saga periodically dispatches the time updater action', t => {
    t.is(1, 1);
    testSaga(now)
        .next()
        .delay(1000)
        .next()
        .put(timeUpdated())
        .next()
        .delay(1000)
        .next()
        .put(timeUpdated());

    // etc.
});
