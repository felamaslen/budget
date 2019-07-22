import test from 'ava';

import reducer, { initialState } from '~client/reducers/suggestions';
import {
    suggestionsRequested,
    suggestionsReceived,
    suggestionsCleared
} from '~client/actions/suggestions';
import { loggedOut } from '~client/actions/login';

test('Null action returns the initial state', t => {
    t.is(reducer(undefined, null), initialState);
});

test('LOGGED_OUT resets the state', t => {
    t.deepEqual(reducer(undefined, loggedOut()), initialState);
});

test('SUGGESTIONS_REQUESTED sets loading to true', t => {
    const state = {};
    const action = suggestionsRequested('food', 'category', 'fi');
    const result = reducer(state, action);

    t.true(result.loading);
});

test('SUGGESTIONS_RECEIVED sets the list and next-column list', t => {
    const state = {};
    const action = suggestionsReceived('item', {
        list: ['salmon', 'sausages'],
        nextCategory: ['fish', 'pork']
    });
    const result = reducer(state, action);

    t.false(result.loading);
    t.deepEqual(result.list, ['salmon', 'sausages']);
    t.deepEqual(result.next, ['fish', 'pork']);
});

test('SUGGESTIONS_RECEIVED sets empty arrays if the results are not present', t => {
    t.deepEqual(reducer({}, suggestionsReceived('item', {})), {
        loading: false,
        list: [],
        next: []
    });

    t.deepEqual(reducer({}, suggestionsReceived('item', {
        list: []
    })), {
        loading: false,
        list: [],
        next: []
    });

    t.deepEqual(reducer({}, suggestionsReceived('item', {
        next: []
    })), {
        loading: false,
        list: [],
        next: []
    });
});

test('SUGGESTIONS_CLEARED clears the list and next-column list', t => {
    const state = {
        list: ['salmon', 'sausages'],
        next: ['fish', 'pork']
    };
    const action = suggestionsCleared();
    const result = reducer(state, action);

    t.deepEqual(result.list, []);
    t.deepEqual(result.next, []);
});
