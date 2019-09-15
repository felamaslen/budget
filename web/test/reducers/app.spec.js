import test from 'ava';
import '~client-test/browser';

import reducer, { initialState } from '~client/reducers/app';
import {
    windowResized,
} from '~client/actions/app';
import { loggedOut } from '~client/actions/login';

test('Null action returns the initial state', (t) => {
    t.is(reducer(undefined, null), initialState);
});

test('LOGGED_OUT resets the state', (t) => {
    t.deepEqual(reducer(undefined, loggedOut()), initialState);
});

test('WINDOW_RESIZED sets the window size', (t) => {
    const state = {};
    const action = windowResized(1000);
    const result = reducer(state, action);

    t.deepEqual(result, { windowWidth: 1000 });
});
