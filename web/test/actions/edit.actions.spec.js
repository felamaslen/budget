import test from 'ava';

import {
    aEditableActivated,
    aEditableChanged,
    aListItemAdded,
    aListItemDeleted,
    aFundTransactionsAdded,
    aFundTransactionsChanged,
    aFundTransactionsRemoved,
    aSuggestionsRequested,
    aSuggestionsReceived
} from '~client/actions/edit.actions';

import {
    EDIT_ACTIVATED,
    EDIT_CHANGED,
    EDIT_LIST_ITEM_ADDED,
    EDIT_LIST_ITEM_DELETED,
    EDIT_FUND_TRANSACTIONS_ADDED,
    EDIT_FUND_TRANSACTIONS_CHANGED,
    EDIT_FUND_TRANSACTIONS_REMOVED,
    EDIT_SUGGESTIONS_REQUESTED,
    EDIT_SUGGESTIONS_RECEIVED
} from '~client/constants/actions';

test('aEditableActivated returns EDIT_ACTIVATED with req object', t => {
    t.deepEqual(aEditableActivated({
        foo: 'bar'
    }), {
        type: EDIT_ACTIVATED,
        foo: 'bar'
    });
});

test('aEditableChanged returns EDIT_ACTIVATED with value', t => {
    t.deepEqual(aEditableChanged('value'), {
        type: EDIT_CHANGED,
        value: 'value'
    });
});

test('aListItemAdded returns EDIT_LIST_ITEM_ADDED with req object', t => {
    t.deepEqual(aListItemAdded({ foo: 'bar' }), {
        type: EDIT_LIST_ITEM_ADDED,
        foo: 'bar'
    });
});

test('aListItemDeleted returns EDIT_LIST_ITEM_DELETED with item', t => {
    t.deepEqual(aListItemDeleted({ foo: 'bar' }), {
        type: EDIT_LIST_ITEM_DELETED,
        foo: 'bar'
    });
});

test('aSuggestionsReceived returns EDIT_SUGGESTIONS_RECEIVED with a req object and random uuid', t => {
    const action = aSuggestionsRequested({ foo: 'bar' });

    t.is(action.type, EDIT_SUGGESTIONS_REQUESTED);
    t.is(action.foo, 'bar');
    t.is(typeof action.reqId, 'number');
    t.true(action.reqId > 0);
});

test('aSuggestionsReceived returns EDIT_SUGGESTIONS_RECEIVED with a response object', t => {
    t.deepEqual(aSuggestionsReceived({ foo: 'bar' }), {
        type: EDIT_SUGGESTIONS_RECEIVED,
        foo: 'bar'
    });
});

test('aFundTransactionsChanged returns EDIT_FUND_TRANSACTIONS_CHANGED with req object', t => {
    t.deepEqual(aFundTransactionsChanged({ foo: 'bar' }), {
        type: EDIT_FUND_TRANSACTIONS_CHANGED,
        foo: 'bar'
    });
});

test('aFundTransactionsAdded returns EDIT_FUND_TRANSACTIONS_ADDED with req object', t => {
    t.deepEqual(aFundTransactionsAdded({ foo: 'bar' }), {
        type: EDIT_FUND_TRANSACTIONS_ADDED,
        foo: 'bar'
    });
});

test('aFundTransactionsRemoved returns EDIT_FUND_TRANSACTIONS_REMOVED with req object', t => {
    t.deepEqual(aFundTransactionsRemoved({ foo: 'bar' }), {
        type: EDIT_FUND_TRANSACTIONS_REMOVED,
        foo: 'bar'
    });
});
