import test from 'ava';

import makeListReducer from '~client/reducers/list';
import {
    listItemCreated,
    listItemUpdated,
    listItemDeleted
} from '~client/actions/list';
import { dataRead, syncReceived } from '~client/actions/api';
import { loggedOut } from '~client/actions/login';
import { DATA_KEY_ABBR, CREATE, UPDATE, DELETE } from '~client/constants/data';

const page = 'my-page';

const customHandlers = {
    'CUSTOM_HANDLER_101': (state, { foo }) => ({
        baz: foo
    })
};

const initialState = {
    baz: 'initial baz'
};

const myListReducer = makeListReducer(page, customHandlers, initialState);

test('Null action returns the initial state', t => {
    t.deepEqual(myListReducer(undefined, null), { items: [], baz: 'initial baz' });
});

test('LOGGED_OUT resets the state', t => {
    t.deepEqual(myListReducer(undefined, loggedOut()), { items: [], baz: 'initial baz' });
});

test('DATA_READ inserts rows into the state', t => {
    const state = {
        items: []
    };

    const action = dataRead({
        [page]: {
            data: [
                { [DATA_KEY_ABBR.id]: 'some-id', [DATA_KEY_ABBR.item]: 'yes' },
                { [DATA_KEY_ABBR.id]: 'other-id', [DATA_KEY_ABBR.item]: 'no' }
            ]
        }
    });

    const result = myListReducer(state, action);

    t.deepEqual(result.items, [
        { id: 'some-id', item: 'yes' },
        { id: 'other-id', item: 'no' }
    ]);
});

test('LIST_ITEM_CREATED optimistically creates a list item', t => {
    const state = {
        items: []
    };

    const action = listItemCreated(page, {
        some: 'prop',
        is: true
    });

    const result = myListReducer(state, action);

    t.deepEqual(result.items, [
        { id: action.fakeId, some: 'prop', is: true, __optimistic: CREATE }
    ]);
});

test('LIST_ITEM_UPDATED optimistically updates a list item', t => {
    const state = {
        items: [
            { id: 'some-real-id', some: 'prop', is: true }
        ]
    };

    const action = listItemUpdated(page, 'some-real-id', { some: 'different prop' });

    const result = myListReducer(state, action);

    t.deepEqual(result.items, [
        { id: 'some-real-id', some: 'different prop', is: true, __optimistic: UPDATE }
    ]);
});

test('LIST_ITEM_DELETED optimistically deletes a list item', t => {
    const state = {
        items: [
            { id: 'some-real-id', some: 'prop', is: true }
        ]
    };

    const action = listItemDeleted(page, 'some-real-id');

    const result = myListReducer(state, action);

    t.deepEqual(result.items, [
        { id: 'some-real-id', some: 'prop', is: true, __optimistic: DELETE }
    ]);
});

test('Actions intended for other pages are ignored', t => {
    const initialStateCreate = {
        items: []
    };

    t.deepEqual(myListReducer(initialStateCreate, listItemCreated('other-page', {
        some: 'prop',
        is: true
    })), initialStateCreate);

    const initialStateUpdate = {
        items: [{ id: 'some-id', other: 'prop', is: false }]
    };

    t.deepEqual(myListReducer(initialStateUpdate, listItemUpdated('other-page', 'some-id', {
        some: 'prop',
        is: true
    })), initialStateUpdate);

    const initialStateDelete = {
        items: [{ id: 'some-id', other: 'prop', is: false }]
    };

    t.deepEqual(myListReducer(initialStateDelete, listItemDeleted('other-page', 'some-id')), initialStateDelete);
});

const syncRequests = [
    {
        type: CREATE,
        fakeId: 'other-fake-id',
        page: 'some-other-page',
        data: { some: 'data' }
    },
    {
        type: UPDATE,
        page,
        id: 'real-id-z',
        data: { other: 'something' }
    },
    {
        type: DELETE,
        page,
        id: 'real-id-x'
    },
    {
        type: CREATE,
        fakeId: 'some-fake-id',
        page,
        data: { thisItem: true }
    }
];

const syncResponse = [
    {
        id: 'real-id-a'
    },
    {
        id: 'real-id-z'
    },
    null,
    {
        id: 'real-id-b'
    }
];

test('SYNC_RECEIVED updates optimistically-created items with their real IDs', t => {
    const state = {
        items: [
            { id: 'some-fake-id', some: 'prop', is: true, __optimistic: CREATE }
        ]
    };

    const action = syncReceived(syncRequests, syncResponse);

    const result = myListReducer(state, action);

    t.is(result.items.length, 1);
    t.deepEqual(result.items[0], { id: 'real-id-b', some: 'prop', is: true, __optimistic: null });
});

test('SYNC_RECEIVED marks optimistically-updated items as confirmed', t => {
    const state = {
        items: [
            { id: 'real-id-z', some: 'prop', is: true, __optimistic: UPDATE }
        ]
    };

    const action = syncReceived(syncRequests, syncResponse);

    const result = myListReducer(state, action);

    t.is(result.items.length, 1);
    t.deepEqual(result.items[0], { id: 'real-id-z', some: 'prop', is: true, __optimistic: null });
});

test('SYNC_RECEIVED removes optimistically-deleted items from state', t => {
    const state = {
        items: [
            { id: 'real-id-x', some: 'prop', is: true, __optimistic: DELETE }
        ]
    };

    const action = syncReceived(syncRequests, syncResponse);

    const result = myListReducer(state, action);

    t.is(result.items.length, 0);
});

test('Custom handlers produce custom results', t => {
    const state = initialState;

    const action = { type: 'CUSTOM_HANDLER_101', foo: 'something else' };

    const result = myListReducer(state, action);

    t.is(result.baz, 'something else');
});
