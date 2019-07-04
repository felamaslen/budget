/* eslint-disable prefer-reflect */
import test from 'ava';
import '~client-test/browser';
import { testSaga } from 'redux-saga-test-plan';
import appSaga, {
    watchEventEmitter,
    windowResizeEventChannel
} from '~client/sagas/app';
import { windowResized } from '~client/actions/app';

test('watchEventEmitter dispatching an action emitted by the channel', t => {
    t.is(1, 1);
    const channel = windowResizeEventChannel();

    testSaga(watchEventEmitter, windowResizeEventChannel)
        .next()
        .call(windowResizeEventChannel)
        .next(channel)
        .take(channel)
        .next(windowResized(100))
        .put(windowResized(100))
        .next()
        .take(channel)
        .next(windowResized(105))
        .put(windowResized(105));
});

test('appSaga forks other sagas', t => {
    t.is(1, 1);

    testSaga(appSaga)
        .next()
        .fork(watchEventEmitter, windowResizeEventChannel)
        .next()
        .isDone();
});
