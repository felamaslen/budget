import test from 'ava';

import reducer, { initialState } from '~client/reducers/error';
import {
    errorOpened,
    errorClosed,
    errorRemoved
} from '~client/actions/error';

test('Null action returns the initial state', t => {
    t.is(reducer(undefined, null), initialState);
});

test('ERROR_OPENED adds a message to the list', t => {
    const state = [];
    const message = { text: 'some message', level: 'foo_level' };
    const action = errorOpened(message);
    const result = reducer(state, action);

    t.deepEqual(result, [
        { id: action.id, message }
    ]);
});

test('ERROR_CLOSED hides a message', t => {
    const state = [
        { id: 'some_id', message: 'some message' }
    ];
    const action = errorClosed('some_id');
    const result = reducer(state, action);

    t.deepEqual(result, [
        { id: 'some_id', message: 'some message', closed: true }
    ]);
});

test('ERROR_REMOVED removes a message', t => {
    const state = [
        { id: 'some_id', message: 'some message', closed: true }
    ];
    const action = errorRemoved('some_id');
    const result = reducer(state, action);

    t.deepEqual(result, []);
});
