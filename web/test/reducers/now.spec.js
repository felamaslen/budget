import test from 'ava';
import sinon from 'sinon';
import { DateTime } from 'luxon';

import reducer, { initialState } from '~client/reducers/now';
import { timeUpdated } from '~client/actions/now';

test('Null action returns the initial state', (t) => {
    t.is(reducer(undefined, null), initialState);
});

test('TIME_UPDATED updates the state to the current time', (t) => {
    const clock = sinon.useFakeTimers(new Date('2019-07-04T18:03Z').getTime());

    const state = null;

    const result = reducer(state, timeUpdated());

    t.deepEqual(result, DateTime.fromISO('2019-07-04T18:03Z'));

    clock.restore();
});

test('State is memoised with second precision', (t) => {
    const clock = sinon.useFakeTimers(new Date('2019-07-04T18:03:31.001Z'));

    const state = reducer(null, timeUpdated());

    t.deepEqual(state, DateTime.fromISO('2019-07-04T18:03:31.001Z'));

    clock.tick(432);
    t.is(reducer(state, timeUpdated()), state);

    clock.tick(566);
    t.is(reducer(state, timeUpdated()), state);

    clock.tick(1);
    const next = reducer(state, timeUpdated());

    t.not(next, state);
    t.deepEqual(next, DateTime.fromISO('2019-07-04T18:03:32.000Z'));

    clock.tick(60000);
    t.deepEqual(reducer(next, timeUpdated()), DateTime.fromISO('2019-07-04T18:04:32.000Z'));

    clock.restore();
});
