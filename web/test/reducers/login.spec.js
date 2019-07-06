import test from 'ava';

import reducer, { initialState } from '~client/reducers/login';
import {
    loginRequested,
    loginErrorOccurred,
    loggedIn,
    loggedOut
} from '~client/actions/login';

test('Null action returns the initial state', t => {
    t.is(reducer(undefined, null), initialState);
});

test('LOGGED_OUT sets initialised to true', t => {
    t.deepEqual(reducer(undefined, loggedOut()), { ...initialState, initialised: true });
});

test('LOGIN_REQUESTED sets loading to true', t => {
    const state = {};
    const action = loginRequested('1234');
    const result = reducer(state, action);

    t.is(result.loading, true);
});

test('LOGIN_ERROR_OCCURRED sets error to true and loading to false', t => {
    const err = new Error('bad pin or something');

    const state = {};
    const action = loginErrorOccurred(err);
    const result = reducer(state, action);

    t.is(result.loading, false);
    t.is(result.error, err);
    t.is(result.initialised, true);
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

    t.is(result.loading, false);
    t.is(result.error, null);

    t.is(result.uid, 'some-long-id');
    t.is(result.name, 'someone');
    t.is(result.initialised, true);
});
