/* eslint-disable max-lines */
import test from 'ava';
import { DateTime } from 'luxon';

import reducer, { initialState } from '~client/reducers/net-worth';
import {
    netWorthCategoryCreated,
    netWorthCategoryUpdated,
    netWorthCategoryDeleted,
    netWorthSubcategoryCreated,
    netWorthSubcategoryUpdated,
    netWorthSubcategoryDeleted,
    netWorthCreated,
    netWorthUpdated,
    netWorthDeleted
} from '~client/actions/net-worth';
import { dataRead, syncReceived } from '~client/actions/api';
import { loggedOut } from '~client/actions/login';
import { CREATE, UPDATE, DELETE } from '~client/constants/data';

const CATEGORY_CASH = {
    id: 'real-cash-category-id',
    type: 'asset',
    category: 'Cash (easy access)',
    color: '#00ff00'
};

const CATEGORY_MORTGAGE = {
    id: 'real-mortgage-category-id',
    type: 'liability',
    category: 'Mortgage',
    color: '#fa0000'
};

const CATEGORY_CC = {
    id: 'real-credit-card-category-id',
    type: 'liability',
    category: 'Credit cards',
    color: '#fc0000'
};

const SUBCATEGORY_WALLET = {
    id: 'real-wallet-subcategory-id',
    categoryId: CATEGORY_CASH.id,
    subcategory: 'My wallet',
    hasCreditLimit: null,
    opacity: 0.2
};

const SUBCATEGORY_HOUSE = {
    id: 'real-house-subcategory-id',
    categoryId: CATEGORY_MORTGAGE.id,
    subcategory: 'My house',
    hasCreditLimit: false,
    opacity: 0.1
};

const SUBCATEGORY_CC = {
    id: 'real-credit-card-subcategory-id',
    categoryId: CATEGORY_CC.id,
    subcategory: 'My credit card',
    hasCreditLimit: true,
    opacity: 0.3
};

test('Null action returns the initial state', t => {
    t.deepEqual(reducer(undefined, null), initialState);
});

test('LOGGED_OUT resets the state', t => {
    t.deepEqual(reducer(undefined, loggedOut()), initialState);
});

test('NET_WORTH_CATEGORY_CREATED optimistically creates a category', t => {
    const state = {
        categories: []
    };

    const action = netWorthCategoryCreated({
        type: 'asset',
        category: 'Cash (easy access)',
        color: '#00ff00'
    });

    const result = reducer(state, action);

    t.deepEqual(result.categories, [{
        id: action.fakeId,
        type: 'asset',
        category: 'Cash (easy access)',
        color: '#00ff00',
        __optimistic: CREATE
    }]);
});

test('NET_WORTH_CATEGORY_UPDATED optimistically updates a category', t => {
    const state = {
        categories: [{
            id: 'some-real-id',
            type: 'asset',
            category: 'Cash (easy access)',
            color: '#00ff00'
        }]
    };

    const action = netWorthCategoryUpdated('some-real-id', {
        type: 'liability',
        category: 'Mortgage',
        color: '#fa0000'
    });

    const result = reducer(state, action);

    t.deepEqual(result.categories, [{
        id: 'some-real-id',
        type: 'liability',
        category: 'Mortgage',
        color: '#fa0000',
        __optimistic: UPDATE
    }]);
});

test('NET_WORTH_CATEGORY_DELETED optimistically deletes a category', t => {
    const state = {
        categories: [{
            id: 'some-real-id',
            type: 'asset',
            category: 'Cash (easy access)',
            color: '#00ff00'
        }],
        subcategories: [],
        entries: []
    };

    const action = netWorthCategoryDeleted('some-real-id');

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [{
            id: 'some-real-id',
            type: 'asset',
            category: 'Cash (easy access)',
            color: '#00ff00',
            __optimistic: DELETE
        }],
        subcategories: [],
        entries: []
    });
});

test('NET_WORTH_CATEGORY_DELETED deletes a pending category and its dependencies', t => {
    const state = {
        categories: [
            {
                id: 'some-real-id',
                type: 'asset',
                category: 'Cash (easy access)',
                color: '#00ff00',
                __optimistic: CREATE
            },
            { id: 'other-cat-id' }
        ],
        subcategories: [
            { categoryId: 'some-real-id', id: 'subcat-A', __optimistic: CREATE },
            { categoryId: 'other-cat-id', id: 'subcat-B' }
        ],
        entries: [
            {
                id: 'entry-A0',
                values: [
                    { subcategory: 'subcat-B' },
                    { subcategory: 'subcat-A' }
                ],
                __optimistic: CREATE
            }
        ]
    };

    const action = netWorthCategoryDeleted('some-real-id');

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [{ id: 'other-cat-id' }],
        subcategories: [{ categoryId: 'other-cat-id', id: 'subcat-B' }],
        entries: [{ id: 'entry-A0', values: [{ subcategory: 'subcat-B' }], __optimistic: CREATE }]
    });
});

test('NET_WORTH_SUBCATEGORY_CREATED optimistically creates a subcategory', t => {
    const state = {
        subcategories: []
    };

    const action = netWorthSubcategoryCreated({
        categoryId: 'some-category-id',
        subcategory: 'My bank account',
        hasCreditLimit: null,
        opacity: 0.2
    });

    const result = reducer(state, action);

    t.deepEqual(result.subcategories, [{
        id: action.fakeId,
        categoryId: 'some-category-id',
        subcategory: 'My bank account',
        hasCreditLimit: null,
        opacity: 0.2,
        __optimistic: CREATE
    }]);
});

test('NET_WORTH_SUBCATEGORY_UPDATED optimistically updates a subcategory', t => {
    const state = {
        subcategories: [{
            id: 'some-subcategory-id',
            categoryId: 'some-category-id',
            subcategory: 'My bank account',
            hasCreditLimit: null,
            opacity: 0.2
        }]
    };

    const action = netWorthSubcategoryUpdated('some-subcategory-id', {
        categoryId: 'other-category-id',
        subcategory: 'My credit card',
        hasCreditLimit: true,
        opacity: 0.3
    });

    const result = reducer(state, action);

    t.deepEqual(result.subcategories, [{
        id: 'some-subcategory-id',
        categoryId: 'other-category-id',
        subcategory: 'My credit card',
        hasCreditLimit: true,
        opacity: 0.3,
        __optimistic: UPDATE
    }]);
});

test('NET_WORTH_SUBCATEGORY_DELETED optimistically deletes a subcategory', t => {
    const state = {
        categories: [{ id: 'some-category-id' }],
        subcategories: [{
            id: 'some-subcategory-id',
            categoryId: 'some-category-id',
            subcategory: 'My bank account',
            hasCreditLimit: null,
            opacity: 0.2
        }],
        entries: []
    };

    const action = netWorthSubcategoryDeleted('some-subcategory-id');

    const result = reducer(state, action);

    t.deepEqual(result.subcategories, [{
        id: 'some-subcategory-id',
        categoryId: 'some-category-id',
        subcategory: 'My bank account',
        hasCreditLimit: null,
        opacity: 0.2,
        __optimistic: DELETE
    }]);
});

test('NET_WORTH_SUBCATEGORY_DELETED deletes a pending subcategory and its dependencies', t => {
    const state = {
        categories: [{ id: 'some-category-id' }],
        subcategories: [
            {
                id: 'some-subcategory-id',
                categoryId: 'some-category-id',
                subcategory: 'My bank account',
                hasCreditLimit: null,
                opacity: 0.2,
                __optimistic: CREATE
            },
            { id: 'subcat-A', categoryId: 'some-category-id' }
        ],
        entries: [
            {
                id: 'entry-A0',
                values: [
                    { subcategory: 'some-subcategory-id' },
                    { subcategory: 'subcat-A' }
                ],
                __optimistic: CREATE
            }
        ]
    };

    const action = netWorthSubcategoryDeleted('some-subcategory-id');

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [{ id: 'some-category-id' }],
        subcategories: [{ id: 'subcat-A', categoryId: 'some-category-id' }],
        entries: [{
            id: 'entry-A0',
            values: [{ subcategory: 'subcat-A' }],
            __optimistic: CREATE
        }]
    });
});

test('NET_WORTH_CREATED optimistically creates an entry', t => {
    const state = {
        entries: []
    };

    const action = netWorthCreated({
        date: DateTime.fromISO('2019-07-12T12:36:03Z'),
        values: [
            {
                subcategory: 'some-subcategory-id',
                skip: true,
                value: -239
            },
            {
                subcategory: 'other-subcategory-id',
                skip: null,
                value: [
                    10,
                    { currency: 'CZK', value: 37.34 }
                ]
            }
        ],
        creditLimit: [
            { subcategory: 'some-subcategory-id', value: 1000 }
        ],
        currencies: [
            { currency: 'CZK', rate: 0.035 }
        ]
    });

    const result = reducer(state, action);

    t.deepEqual(result.entries, [{
        id: action.fakeId,
        date: DateTime.fromISO('2019-07-12T12:36:03Z'),
        values: [
            {
                subcategory: 'some-subcategory-id',
                skip: true,
                value: -239
            },
            {
                subcategory: 'other-subcategory-id',
                skip: null,
                value: [
                    10,
                    { currency: 'CZK', value: 37.34 }
                ]
            }
        ],
        creditLimit: [
            { subcategory: 'some-subcategory-id', value: 1000 }
        ],
        currencies: [
            { currency: 'CZK', rate: 0.035 }
        ],
        __optimistic: CREATE
    }]);
});

test('NET_WORTH_UPDATED optimistically updates an entry', t => {
    const state = {
        entries: [{
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: 'some-subcategory-id',
                    skip: true,
                    value: -239
                },
                {
                    subcategory: 'other-subcategory-id',
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: 'some-subcategory-id', value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ]
        }]
    };

    const action = netWorthUpdated('some-entry-id', {
        date: DateTime.fromISO('2019-07-31T23:54:00Z'),
        values: [
            {
                subcategory: 'some-subcategory-id',
                skip: true,
                value: -239
            }
        ],
        creditLimit: [],
        currencies: []
    });

    const result = reducer(state, action);

    t.deepEqual(result.entries, [{
        id: 'some-entry-id',
        date: DateTime.fromISO('2019-07-31T23:54:00Z'),
        values: [
            {
                subcategory: 'some-subcategory-id',
                skip: true,
                value: -239
            }
        ],
        creditLimit: [],
        currencies: [],
        __optimistic: UPDATE
    }]);
});

test('NET_WORTH_DELETED optimistically deletes an entry', t => {
    const state = {
        entries: [{
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: 'some-subcategory-id',
                    skip: true,
                    value: -239
                },
                {
                    subcategory: 'other-subcategory-id',
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: 'some-subcategory-id', value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ]
        }]
    };

    const action = netWorthDeleted('some-entry-id');

    const result = reducer(state, action);

    t.deepEqual(result.entries, [{
        id: 'some-entry-id',
        date: DateTime.fromISO('2019-07-12T12:36:03Z'),
        values: [
            {
                subcategory: 'some-subcategory-id',
                skip: true,
                value: -239
            },
            {
                subcategory: 'other-subcategory-id',
                skip: null,
                value: [
                    10,
                    { currency: 'CZK', value: 37.34 }
                ]
            }
        ],
        creditLimit: [
            { subcategory: 'some-subcategory-id', value: 1000 }
        ],
        currencies: [
            { currency: 'CZK', rate: 0.035 }
        ],
        __optimistic: DELETE
    }]);
});

test('DATA_READ inserts data into the state', t => {
    const state = {
        categories: [],
        subcategories: [],
        entries: []
    };

    const action = dataRead({
        netWorth: {
            categories: {
                data: [{
                    id: 'some-category-id',
                    type: 'asset',
                    category: 'Cash (easy access)',
                    color: '#00ff00'
                }]
            },
            subcategories: {
                data: [{
                    id: 'some-subcategory-id',
                    categoryId: 'some-category-id',
                    subcategory: 'My bank account',
                    hasCreditLimit: null,
                    opacity: 0.2
                }]
            },
            entries: {
                data: {
                    count: 17,
                    data: [{
                        id: 'some-entry-id',
                        date: '2019-07-12',
                        values: [
                            {
                                subcategory: 'some-subcategory-id',
                                skip: true,
                                value: -239
                            },
                            {
                                subcategory: 'other-subcategory-id',
                                skip: null,
                                value: [
                                    10,
                                    { currency: 'CZK', value: 37.34 }
                                ]
                            }
                        ],
                        creditLimit: [
                            { subcategory: 'some-subcategory-id', value: 1000 }
                        ],
                        currencies: [
                            { currency: 'CZK', rate: 0.035 }
                        ]
                    }]
                }
            }
        }
    });

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [{
            id: 'some-category-id',
            type: 'asset',
            category: 'Cash (easy access)',
            color: '#00ff00'
        }],
        subcategories: [{
            id: 'some-subcategory-id',
            categoryId: 'some-category-id',
            subcategory: 'My bank account',
            hasCreditLimit: null,
            opacity: 0.2
        }],
        entries: [{
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12'),
            values: [
                {
                    subcategory: 'some-subcategory-id',
                    skip: true,
                    value: -239
                },
                {
                    subcategory: 'other-subcategory-id',
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: 'some-subcategory-id', value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ]
        }]
    });
});

test('SYNC_RECEIVED confirms category creates, updating any dependencies', t => {
    const state = {
        categories: [CATEGORY_CASH, {
            ...CATEGORY_CC,
            id: 'some-fake-category-id',
            __optimistic: CREATE
        }],
        subcategories: [SUBCATEGORY_WALLET, {
            ...SUBCATEGORY_CC,
            id: 'some-fake-subcategory-id',
            categoryId: 'some-fake-category-id',
            __optimistic: CREATE
        }],
        entries: [{
            id: 'some-fake-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: 'some-fake-subcategory-id',
                    skip: true,
                    value: -239
                },
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: 'some-fake-subcategory-id', value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ],
            __optimistic: CREATE
        }]
    };

    const action = syncReceived([], [], [
        {
            type: CREATE,
            fakeId: 'some-fake-category-id',
            method: 'post',
            route: 'net-worth/categories',
            body: {
                type: 'liability',
                category: 'Mortgage',
                color: '#fa0000'
            },
            res: CATEGORY_CC
        }
    ]);

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [
            CATEGORY_CASH,
            { ...CATEGORY_CC, __optimistic: null }
        ],
        subcategories: [
            SUBCATEGORY_WALLET,
            {
                ...SUBCATEGORY_CC,
                // the subcategory can only be created after its category is confirmed
                id: 'some-fake-subcategory-id',
                __optimistic: CREATE
            }
        ],
        entries: [{
            id: 'some-fake-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: 'some-fake-subcategory-id',
                    skip: true,
                    value: -239
                },
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: 'some-fake-subcategory-id', value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ],
            // the entry can only be created after its subcategories are confirmed
            __optimistic: CREATE
        }]
    });
});

test('SYNC_RECEIVED confirms category updates', t => {
    const state = {
        categories: [{
            ...CATEGORY_CC,
            __optimistic: UPDATE
        }],
        subcategories: [],
        entries: []
    };

    const action = syncReceived([], [], [
        {
            type: UPDATE,
            id: CATEGORY_CC.id,
            method: 'put',
            route: 'net-worth/categories',
            body: {
                type: 'asset',
                category: 'This is now an asset group',
                color: '#00aa00'
            },
            res: {
                id: CATEGORY_CC.id,
                type: 'asset',
                category: 'This is now an asset group',
                color: '#00aa00'
            }
        }
    ]);

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [{
            id: CATEGORY_CC.id,
            type: 'asset',
            category: 'This is now an asset group',
            color: '#00aa00',
            __optimistic: null
        }],
        subcategories: [],
        entries: []
    });
});

test('SYNC_RECEIVED confirms category deletes, removing any dependencies', t => {
    const state = {
        categories: [
            {
                ...CATEGORY_CC,
                __optimistic: DELETE
            },
            CATEGORY_CASH
        ],
        subcategories: [SUBCATEGORY_CC, SUBCATEGORY_WALLET],
        entries: [{
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: SUBCATEGORY_CC.id,
                    skip: true,
                    value: -239
                },
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: SUBCATEGORY_CC.id, value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ]
        }]
    };

    const action = syncReceived([], [], [
        {
            type: DELETE,
            id: CATEGORY_CC.id,
            method: 'delete',
            route: 'net-worth/categories',
            res: null
        }
    ]);

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [CATEGORY_CASH],
        // The dependencies are deleted from the database through foreign key cascading,
        // but we have to update on the frontend to reflect that
        subcategories: [SUBCATEGORY_WALLET],
        entries: [{
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ]
        }]
    });
});

test('SYNC_RECEIVED confirms subcategory creates, updating any dependencies', t => {
    const state = {
        categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
        subcategories: [SUBCATEGORY_HOUSE, SUBCATEGORY_WALLET, {
            ...SUBCATEGORY_CC,
            id: 'some-fake-subcategory-id',
            __optimistic: CREATE
        }],
        entries: [{
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: 'some-fake-subcategory-id',
                    skip: true,
                    value: -239
                },
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: 'some-fake-subcategory-id', value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ],
            __optimistic: CREATE
        }]
    };

    const action = syncReceived([], [], [
        {
            type: CREATE,
            fakeId: 'some-fake-subcategory-id',
            method: 'post',
            route: 'net-worth/subcategories',
            body: {
                categoryId: CATEGORY_CC.id,
                subcategory: 'My credit card',
                hasCreditLimit: true,
                opacity: 0.2
            },
            res: SUBCATEGORY_CC
        }
    ]);

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
        subcategories: [SUBCATEGORY_HOUSE, SUBCATEGORY_WALLET, {
            ...SUBCATEGORY_CC,
            __optimistic: null
        }],
        entries: [{
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: SUBCATEGORY_CC.id,
                    skip: true,
                    value: -239
                },
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: SUBCATEGORY_CC.id, value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ],
            __optimistic: CREATE
        }]
    });
});

test('SYNC_RECEIVED confirms subcategory updates', t => {
    const state = {
        categories: [CATEGORY_MORTGAGE],
        subcategories: [{
            ...SUBCATEGORY_HOUSE,
            __optimistic: UPDATE
        }],
        entries: []
    };

    const action = syncReceived([], [], [
        {
            type: UPDATE,
            id: SUBCATEGORY_HOUSE.id,
            method: 'put',
            route: 'net-worth/subcategories',
            body: {
                categoryId: CATEGORY_MORTGAGE.id,
                subcategory: 'My house',
                hasCreditLimit: false,
                opacity: 0.2
            },
            res: SUBCATEGORY_HOUSE
        }
    ]);

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [CATEGORY_MORTGAGE],
        subcategories: [{
            ...SUBCATEGORY_HOUSE,
            __optimistic: null
        }],
        entries: []
    });
});

test('SYNC_RECEIVED confirms subcategory deletes, removing any dependencies', t => {
    const state = {
        categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
        subcategories: [SUBCATEGORY_WALLET, SUBCATEGORY_HOUSE, {
            ...SUBCATEGORY_CC,
            __optimistic: DELETE
        }],
        entries: [{
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: SUBCATEGORY_CC.id,
                    skip: false,
                    value: -239
                },
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: SUBCATEGORY_CC.id, value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ]
        }]
    };

    const action = syncReceived([], [], [
        {
            type: DELETE,
            id: SUBCATEGORY_CC.id,
            method: 'delete',
            route: 'net-worth/subcategories',
            res: null
        }
    ]);

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
        // The dependencies are deleted from the database through foreign key cascading,
        // but we have to update on the frontend to reflect that
        subcategories: [SUBCATEGORY_WALLET, SUBCATEGORY_HOUSE],
        entries: [{
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ]
        }]
    });
});

test('SYNC_RECEIVED confirms entry creates', t => {
    const state = {
        categories: [
            CATEGORY_MORTGAGE,
            CATEGORY_CC,
            CATEGORY_CASH
        ],
        subcategories: [
            SUBCATEGORY_HOUSE,
            SUBCATEGORY_CC,
            SUBCATEGORY_WALLET
        ],
        entries: [{
            id: 'some-fake-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: SUBCATEGORY_HOUSE.id,
                    skip: true,
                    value: -239
                },
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: SUBCATEGORY_CC.id, value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ],
            __optimistic: CREATE
        }]
    };

    const action = syncReceived([], [], [
        {
            type: CREATE,
            fakeId: 'some-fake-entry-id',
            method: 'post',
            route: 'net-worth',
            body: {
                date: '2019-07-12',
                values: [
                    {
                        subcategory: SUBCATEGORY_HOUSE.id,
                        skip: true,
                        value: -239
                    },
                    {
                        subcategory: SUBCATEGORY_WALLET.id,
                        skip: null,
                        value: [
                            10,
                            { currency: 'CZK', value: 37.34 }
                        ]
                    }
                ],
                creditLimit: [
                    { subcategory: SUBCATEGORY_CC.id, value: 1000 }
                ],
                currencies: [
                    { currency: 'CZK', rate: 0.035 }
                ]
            },
            res: {
                id: 'some-real-entry-id',
                date: '2019-07-12',
                values: [
                    {
                        subcategory: SUBCATEGORY_HOUSE.id,
                        skip: true,
                        value: -239
                    },
                    {
                        subcategory: SUBCATEGORY_WALLET.id,
                        skip: null,
                        value: [
                            10,
                            { currency: 'CZK', value: 37.34 }
                        ]
                    }
                ],
                creditLimit: [
                    { subcategory: SUBCATEGORY_CC.id, value: 1000 }
                ],
                currencies: [
                    { currency: 'CZK', rate: 0.035 }
                ]
            }
        }
    ]);

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [
            CATEGORY_MORTGAGE,
            CATEGORY_CC,
            CATEGORY_CASH
        ],
        subcategories: [
            SUBCATEGORY_HOUSE,
            SUBCATEGORY_CC,
            SUBCATEGORY_WALLET
        ],
        entries: [{
            id: 'some-real-entry-id',
            date: DateTime.fromISO('2019-07-12'),
            values: [
                {
                    subcategory: SUBCATEGORY_HOUSE.id,
                    skip: true,
                    value: -239
                },
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: SUBCATEGORY_CC.id, value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ],
            __optimistic: null
        }]
    });
});

test('SYNC_RECEIVED confirms entry updates', t => {
    const state = {
        categories: [
            CATEGORY_MORTGAGE,
            CATEGORY_CASH,
            CATEGORY_CC
        ],
        subcategories: [
            SUBCATEGORY_HOUSE,
            SUBCATEGORY_CC,
            SUBCATEGORY_WALLET
        ],
        entries: [{
            id: 'some-real-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: SUBCATEGORY_HOUSE.id,
                    skip: true,
                    value: -239
                },
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: SUBCATEGORY_CC.id, value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ],
            __optimistic: UPDATE
        }]
    };

    const action = syncReceived([], [], [
        {
            type: UPDATE,
            id: 'some-real-entry-id',
            method: 'put',
            route: 'net-worth',
            body: {
                date: '2019-07-12',
                values: [
                    {
                        subcategory: SUBCATEGORY_HOUSE.id,
                        skip: true,
                        value: -239
                    },
                    {
                        subcategory: SUBCATEGORY_WALLET.id,
                        skip: null,
                        value: [
                            10,
                            { currency: 'CZK', value: 37.34 }
                        ]
                    }
                ],
                creditLimit: [
                    { subcategory: SUBCATEGORY_CC.id, value: 1000 }
                ],
                currencies: [
                    { currency: 'CZK', rate: 0.035 }
                ]
            },
            res: {
                id: 'some-real-entry-id',
                date: '2019-07-12',
                values: [
                    {
                        subcategory: SUBCATEGORY_HOUSE.id,
                        skip: true,
                        value: -239
                    },
                    {
                        subcategory: SUBCATEGORY_WALLET.id,
                        skip: null,
                        value: [
                            10,
                            { currency: 'CZK', value: 37.34 }
                        ]
                    }
                ],
                creditLimit: [
                    { subcategory: SUBCATEGORY_CC.id, value: 1000 }
                ],
                currencies: [
                    { currency: 'CZK', rate: 0.035 }
                ]
            }
        }
    ]);

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [
            CATEGORY_MORTGAGE,
            CATEGORY_CASH,
            CATEGORY_CC
        ],
        subcategories: [
            SUBCATEGORY_HOUSE,
            SUBCATEGORY_CC,
            SUBCATEGORY_WALLET
        ],
        entries: [{
            id: 'some-real-entry-id',
            date: DateTime.fromISO('2019-07-12'),
            values: [
                {
                    subcategory: SUBCATEGORY_HOUSE.id,
                    skip: true,
                    value: -239
                },
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: SUBCATEGORY_CC.id, value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ],
            __optimistic: null
        }]
    });
});

test('SYNC_RECEIVED confirms entry deletes', t => {
    const state = {
        categories: [
            CATEGORY_CC,
            CATEGORY_CASH
        ],
        subcategories: [
            SUBCATEGORY_CC,
            SUBCATEGORY_WALLET
        ],
        entries: [{
            id: 'some-real-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
            values: [
                {
                    subcategory: SUBCATEGORY_CC.id,
                    skip: false,
                    value: -239
                },
                {
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [
                        10,
                        { currency: 'CZK', value: 37.34 }
                    ]
                }
            ],
            creditLimit: [
                { subcategory: SUBCATEGORY_CC.id, value: 1000 }
            ],
            currencies: [
                { currency: 'CZK', rate: 0.035 }
            ],
            __optimistic: DELETE
        }]
    };

    const action = syncReceived([], [], [
        {
            type: DELETE,
            id: 'some-real-entry-id',
            method: 'delete',
            route: 'net-worth',
            res: null
        }
    ]);

    const result = reducer(state, action);

    t.deepEqual(result, {
        categories: [
            CATEGORY_CC,
            CATEGORY_CASH
        ],
        subcategories: [
            SUBCATEGORY_CC,
            SUBCATEGORY_WALLET
        ],
        entries: []
    });
});
