/* eslint-disable max-lines */
import test from 'ava';
import { DateTime } from 'luxon';

import makeListReducer, { makeDailyListReducer } from '~client/reducers/list';
import {
    listItemCreated,
    listItemUpdated,
    listItemDeleted
} from '~client/actions/list';
import { dataRead, syncReceived } from '~client/actions/api';
import { loggedOut } from '~client/actions/login';
import { DATA_KEY_ABBR, CREATE, UPDATE, DELETE } from '~client/constants/data';

const page = 'food';

const customHandlers = {
    'CUSTOM_HANDLER_101': (state, { foo }) => ({
        baz: foo
    })
};

const initialState = {
    baz: 'initial baz'
};

const myListReducer = makeListReducer(page, customHandlers, initialState);

const dailyReducer = makeDailyListReducer(page);

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

test('[daily] DATA_READ inserts the all-time total value from response', t => {
    const initialStateDaily = {
        total: 0,
        olderExists: null,
        items: []
    };

    t.deepEqual(dailyReducer(undefined, null), initialStateDaily);

    const actionRead = dataRead({
        [page]: {
            total: 335,
            olderExists: true,
            data: [{
                [DATA_KEY_ABBR.id]: 'some-id',
                [DATA_KEY_ABBR.date]: '2019-05-03',
                [DATA_KEY_ABBR.item]: 'some-item',
                [DATA_KEY_ABBR.cost]: 102
            }]
        }
    });

    const result = dailyReducer(initialStateDaily, actionRead);

    t.deepEqual(result, {
        total: 335,
        olderExists: true,
        items: [{
            id: 'some-id',
            date: DateTime.fromISO('2019-05-03'),
            item: 'some-item',
            cost: 102
        }]
    });
});

test('LIST_ITEM_CREATED optimistically creates a list item', t => {
    const state = {
        items: []
    };

    const action = listItemCreated(page, {
        date: DateTime.fromISO('2019-07-10'),
        item: 'some item',
        category: 'some category',
        cost: 3,
        shop: 'some shop'
    });

    const result = myListReducer(state, action);

    t.deepEqual(result.items, [
        {
            id: action.fakeId,
            date: DateTime.fromISO('2019-07-10'),
            item: 'some item',
            category: 'some category',
            cost: 3,
            shop: 'some shop',
            __optimistic: CREATE
        }
    ]);
});

test('LIST_ITEM_CREATED doesn\'t do anything if not all the data exist', t => {
    const state = {
        items: []
    };

    const action = listItemCreated(page, {
        shop: 'prop',
        cost: 3
    });

    const result = myListReducer(state, action);

    t.deepEqual(result.items, []);
});

test('LIST_ITEM_CREATED omits properties not in the page\'s columns definition', t => {
    const state = {
        items: []
    };

    const action = listItemCreated(page, {
        date: DateTime.fromISO('2019-07-14'),
        item: 'some item',
        category: 'some category',
        cost: 21,
        shop: 'some shop',
        foo: 'bar'
    });

    const result = myListReducer(state, action);

    t.deepEqual(result.items, [
        {
            id: action.fakeId,
            date: DateTime.fromISO('2019-07-14'),
            item: 'some item',
            category: 'some category',
            cost: 21,
            shop: 'some shop',
            __optimistic: CREATE
        }
    ]);
});

test('[daily] LIST_ITEM_CREATED updates the total', t => {
    const state = {
        total: 3,
        items: []
    };

    const action = listItemCreated(page, {
        date: DateTime.fromISO('2019-07-12'),
        item: 'some item',
        category: 'some category',
        cost: 34,
        shop: 'some shop'
    });

    const result = dailyReducer(state, action);

    t.is(result.total, 3 + 34);
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

test('LIST_ITEM_UPDATED omits props which are not present on the item', t => {
    const state = {
        items: [
            { id: 'some-real-id', some: 'prop', is: true }
        ]
    };

    const actionNull = listItemUpdated(page, 'some-real-id', { other: 'should not exist' });

    const resultNull = myListReducer(state, actionNull);

    t.deepEqual(resultNull.items, [
        { id: 'some-real-id', some: 'prop', is: true }
    ]);

    const actionSome = listItemUpdated(page, 'some-real-id', { other: 'should not exist', some: 'thing' });

    const resultSome = myListReducer(state, actionSome);

    t.deepEqual(resultSome.items, [
        { id: 'some-real-id', some: 'thing', is: true, __optimistic: UPDATE }
    ]);
});

test('[daily] LIST_ITEM_UPDATED updates the total', t => {
    const state = {
        total: 5,
        items: [
            { id: 'some-real-id', some: 'prop', cost: 3, is: true }
        ]
    };

    const action = listItemUpdated(page, 'some-real-id', {
        cost: 41,
        some: 'different prop'
    });

    const result = dailyReducer(state, action);

    t.is(result.total, 5 + 41 - 3);
});

test('LIST_ITEM_UPDATED does not alter the status of optimistically created items', t => {
    const state = {
        items: [
            { id: 'some-fake-id', some: 'prop', is: true, __optimistic: CREATE }
        ]
    };

    const action = listItemUpdated(page, 'some-fake-id', { some: 'different prop' });

    const result = myListReducer(state, action);

    t.deepEqual(result.items, [
        { id: 'some-fake-id', some: 'different prop', is: true, __optimistic: CREATE }
    ]);
});

test('LIST_ITEM_DELETED optimistically deletes a list item', t => {
    const state = {
        items: [
            { id: 'some-real-id', some: 'prop', is: true }
        ]
    };

    const action = listItemDeleted('some-real-id', { page });

    const result = myListReducer(state, action);

    t.deepEqual(result.items, [
        { id: 'some-real-id', some: 'prop', is: true, __optimistic: DELETE }
    ]);
});

test('[daily] LIST_ITEM_DELETED updates the total', t => {
    const state = {
        total: 51,
        items: [
            { id: 'some-real-id', some: 'prop', cost: 29, is: true }
        ]
    };

    const action = listItemDeleted('some-real-id', { page });

    const result = dailyReducer(state, action);

    t.is(result.total, 51 - 29);
});

test('LIST_ITEM_DELETED simply removes the item from state, if it was already in an optimistic creation state', t => {
    const state = {
        items: [
            { id: 'some-fake-id', some: 'prop', is: true, __optimistic: CREATE }
        ]
    };

    const action = listItemDeleted('some-fake-id', { page });

    const result = myListReducer(state, action);

    t.deepEqual(result.items, []);
});

test('LIST_ITEM_DELETED updates the optimistic state to DELETE, if it was in an optimistic update state', t => {
    const state = {
        items: [
            { id: 'some-real-id', some: 'prop', is: true, __optimistic: UPDATE }
        ]
    };

    const action = listItemDeleted('some-real-id', { page });

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

    t.deepEqual(myListReducer(initialStateDelete, listItemDeleted('some-id', { page: 'other-page' })), initialStateDelete);
});

const syncRequests = [
    {
        type: CREATE,
        fakeId: 'other-fake-id',
        route: 'some-other-page',
        body: { some: 'data' }
    },
    {
        type: UPDATE,
        route: page,
        id: 'real-id-z',
        body: { other: 'something' }
    },
    {
        type: DELETE,
        route: page,
        id: 'real-id-x'
    },
    {
        type: CREATE,
        fakeId: 'some-fake-id',
        route: page,
        body: { thisItem: true }
    },
    {
        type: CREATE,
        fakeId: 'different-fake-id',
        route: 'different-route',
        body: { some: 'data' }
    }
];

const syncResponse = [
    {
        id: 'real-id-a',
        total: 516
    },
    {
        total: 2354
    },
    {
        total: 1976
    },
    {
        id: 'real-id-b',
        total: 117
    },
    {
        id: 'real-id-different',
        total: 1856
    }
];

const syncReceivedAction = syncReceived({
    list: syncRequests.map((request, index) => ({
        ...request,
        res: syncResponse[index]
    }))
});

test('SYNC_RECEIVED updates optimistically-created items with their real IDs', t => {
    const state = {
        items: [
            { id: 'some-fake-id', some: 'prop', is: true, __optimistic: CREATE }
        ]
    };

    const action = syncReceivedAction;

    const result = myListReducer(state, action);

    t.is(result.items.length, 1);
    t.deepEqual(result.items[0], { id: 'real-id-b', some: 'prop', is: true, __optimistic: null });
});

test('[daily] SYNC_RECEIVED updates the list total from the last response', t => {
    const state = {
        total: 100,
        items: [
            { id: 'some-fake-id', some: 'prop', is: true, __optimistic: CREATE }
        ]
    };

    const action = syncReceivedAction;

    const result = dailyReducer(state, action);

    t.is(result.total, 117);
});

test('[daily] SYNC_RECEIVED doesn\'t update the list total if there wasn\'t a relevant response', t => {
    const state = {
        total: 932,
        items: [
            { id: 'some-real-id', some: 'prop', is: true, __optimistic: UPDATE }
        ]
    };

    const req = [
        { type: UPDATE, id: 'some-real-id', method: 'put', route: `not-${page}`, query: {}, body: { some: 'body' } }
    ];

    const res = [
        { total: 8743 }
    ];

    const action = syncReceived({ list: [{ ...req, res: res[0] }] });

    const result = dailyReducer(state, action);

    t.is(result.total, 932);
});

test('SYNC_RECEIVED marks optimistically-updated items as confirmed', t => {
    const state = {
        items: [
            { id: 'real-id-z', some: 'prop', is: true, __optimistic: UPDATE }
        ]
    };

    const action = syncReceivedAction;

    const result = myListReducer(state, action);

    t.is(result.items.length, 1);
    t.deepEqual(result.items[0], { id: 'real-id-z', some: 'prop', is: true, __optimistic: null });

    t.is(result.total, 117);
});

test('SYNC_RECEIVED removes optimistically-deleted items from state', t => {
    const state = {
        items: [
            { id: 'real-id-x', some: 'prop', is: true, __optimistic: DELETE }
        ]
    };

    const action = syncReceivedAction;

    const result = myListReducer(state, action);

    t.is(result.items.length, 0);
    t.is(result.total, 117);
});

test('Custom handlers produce custom results', t => {
    const state = initialState;

    const action = { type: 'CUSTOM_HANDLER_101', foo: 'something else' };

    const result = myListReducer(state, action);

    t.is(result.baz, 'something else');
});
