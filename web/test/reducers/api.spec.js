import test from 'ava';

import reducer, { initialState } from '~client/reducers/api';
import {
    syncRequested,
    syncReceived,
    syncErrorOccurred
} from '~client/actions/api';
import { loggedIn, loggedOut } from '~client/actions/login';

test('Null action returns the initial state', t => {
    t.is(reducer(undefined, null), initialState);
});

test('LOGGED_IN sets user details', t => {
    const state = {};
    const action = loggedIn({
        name: 'someone',
        uid: 'some-long-id',
        apiKey: 'some-api-key',
        expires: '2019-07-31T23:08:26.442+01:00'
    });
    const result = reducer(state, action);

    t.is(result.key, 'some-api-key');
});

test('LOGGED_OUT resets the state', t => {
    t.deepEqual(reducer(undefined, loggedOut()), initialState);
});

test('SYNC_REQUESTED sets loading to true', t => {
    const state = {};
    const action = syncRequested();

    const result = reducer(state, action);

    t.is(result.loading, true);
});

test('SYNC_RECEIVED sets loading to false', t => {
    const state = {};
    const action = syncReceived();
    const result = reducer(state, action);

    t.is(result.loading, false);
    t.is(result.error, null);
});

test('SYNC_ERROR_OCCURRED sets the error', t => {
    const state = {};
    const err = new Error('something bad happened');
    const action = syncErrorOccurred([], err);
    const result = reducer(state, action);

    t.is(result.loading, false);
    t.is(result.error, err);
});
