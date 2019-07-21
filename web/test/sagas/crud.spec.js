/* eslint-disable prefer-reflect */
import test from 'ava';
import { testSaga } from 'redux-saga-test-plan';
import { debounce, call } from 'redux-saga/effects';
import axios from 'axios';

import crudSaga, {
    updateLists,
    updateNetWorth,
    updateCrud,
    updateCrudFromAction,
    matchCrudAction
} from '~client/sagas/crud';
import { getLocked, getApiKey } from '~client/selectors/api';
import { getCrudRequests } from '~client/selectors/list';
import { getNetWorthRequests } from '~client/selectors/overview/net-worth';
import {
    syncRequested,
    syncLocked,
    syncUnlocked,
    syncReceived,
    syncErrorOccurred
} from '~client/actions/api';
import {
    CREATE,
    UPDATE,
    DELETE,
    API_PREFIX,
    API_BACKOFF_TIME,
    TIMER_UPDATE_SERVER
} from '~client/constants/data';
import {
    LIST_ITEM_CREATED,
    LIST_ITEM_UPDATED,
    LIST_ITEM_DELETED
} from '~client/constants/actions/list';
import {
    NET_WORTH_CATEGORY_CREATED,
    NET_WORTH_CATEGORY_UPDATED,
    NET_WORTH_CATEGORY_DELETED,
    NET_WORTH_SUBCATEGORY_CREATED,
    NET_WORTH_SUBCATEGORY_UPDATED,
    NET_WORTH_SUBCATEGORY_DELETED,
    NET_WORTH_CREATED,
    NET_WORTH_UPDATED,
    NET_WORTH_DELETED
} from '~client/constants/actions/net-worth';

const listRequests = [
    {
        type: CREATE,
        fakeId: 'some-fake-id',
        method: 'post',
        route: 'general',
        query: {},
        body: {
            date: '2019-07-04',
            item: 'some item',
            category: 'some category',
            cost: 2563,
            shop: 'some shop'
        }
    },
    {
        type: UPDATE,
        id: 'some-real-id',
        method: 'put',
        route: 'food',
        query: {},
        body: {
            id: 'some-real-id',
            date: '2019-07-01'
        }
    },
    {
        type: DELETE,
        id: 'other-real-id',
        method: 'delete',
        route: 'holiday',
        query: {},
        body: {
            id: 'other-real-id'
        }
    }
];

const listHttpRequests = [
    {
        method: 'post',
        route: 'general',
        query: {},
        body: {
            date: '2019-07-04',
            item: 'some item',
            category: 'some category',
            cost: 2563,
            shop: 'some shop'
        }
    },
    {
        method: 'put',
        route: 'food',
        query: {},
        body: {
            id: 'some-real-id',
            date: '2019-07-01'
        }
    },
    {
        method: 'delete',
        route: 'holiday',
        query: {},
        body: {
            id: 'other-real-id'
        }
    }
];

const netWorthRequests = [
    {
        type: CREATE,
        fakeId: 'fake-category-id',
        method: 'post',
        route: 'data/net-worth/categories',
        body: {
            foo: 'bar'
        }
    },
    {
        type: DELETE,
        id: 'real-category-id',
        method: 'delete',
        route: 'data/net-worth/categories'
    },
    {
        type: CREATE,
        fakeId: 'fake-subcategory-id-a',
        method: 'post',
        route: 'data/net-worth/subcategories',
        body: {
            categoryId: 'real-category-id'
        }
    },
    {
        type: UPDATE,
        id: 'real-subcategory-id',
        method: 'put',
        route: 'data/net-worth/subcategories',
        body: {
            categoryId: 'real-category-id',
            bar: 'baz'
        }
    },
    {
        type: UPDATE,
        id: 'real-entry-id',
        method: 'put',
        route: 'data/net-worth',
        body: {
            values: [
                { subcategory: 'real-subcategory-id' }
            ],
            creditLimit: [],
            currencies: []
        }
    }
];

test('updateLists calls the API with a request list', t => {
    const res = {
        data: {
            data: [
                { isRes0: true },
                { isRes1: true },
                { isRes2: true }
            ]
        }
    };

    testSaga(updateLists, 'some-api-key', listRequests)
        .next()
        .call(axios.patch, `${API_PREFIX}/data/multiple`, {
            list: listHttpRequests
        }, {
            headers: { Authorization: 'some-api-key' }
        })
        .next(res)
        .returns([
            { ...listRequests[0], res: res.data.data[0] },
            { ...listRequests[1], res: res.data.data[1] },
            { ...listRequests[2], res: res.data.data[2] }
        ]);

    t.pass();
});

test('updateLists does nothing if the request list is empty', t => {
    testSaga(updateLists, 'some-api-key', [])
        .next()
        .returns([]);

    t.pass();
});

test('updateNetWorth calls data/net-worth API endpoints', t => {
    const resList = [
        { data: { isCategory: true } },
        { data: null },
        { data: { isNewSubctegory: true } },
        { data: { isSubcategory: true } },
        { data: { isEntry: true } }
    ];

    testSaga(updateNetWorth, 'some-api-key', netWorthRequests)
        .next()
        .all([
            call(axios, {
                headers: { Authorization: 'some-api-key' },
                method: 'post',
                url: `${API_PREFIX}/data/net-worth/categories`,
                data: {
                    foo: 'bar'
                }
            }),
            call(axios, {
                headers: { Authorization: 'some-api-key' },
                method: 'delete',
                url: `${API_PREFIX}/data/net-worth/categories/real-category-id`,
                data: undefined
            }),
            call(axios, {
                headers: { Authorization: 'some-api-key' },
                method: 'post',
                url: `${API_PREFIX}/data/net-worth/subcategories`,
                data: {
                    categoryId: 'real-category-id'
                }
            }),
            call(axios, {
                headers: { Authorization: 'some-api-key' },
                method: 'put',
                url: `${API_PREFIX}/data/net-worth/subcategories/real-subcategory-id`,
                data: {
                    categoryId: 'real-category-id',
                    bar: 'baz'
                }
            }),
            call(axios, {
                headers: { Authorization: 'some-api-key' },
                method: 'put',
                url: `${API_PREFIX}/data/net-worth/real-entry-id`,
                data: {
                    values: [
                        { subcategory: 'real-subcategory-id' }
                    ],
                    creditLimit: [],
                    currencies: []
                }
            })
        ])
        .next(resList)
        .returns(netWorthRequests.map((request, index) => ({
            ...request,
            res: resList[index].data
        })));

    t.pass();
});

test('updateNetWorth does nothing if the request list is empty', t => {
    testSaga(updateNetWorth, 'some-api-key', [])
        .next()
        .returns([]);

    t.pass();
});

test('updateCrud calls other update sagas', t => {
    const resList = [{ isResList: true }];
    const resNetWorth = [{ isResNetWorth: true }];

    testSaga(updateCrud, 'some-api-key')
        .next()
        .select(getCrudRequests)
        .next(listRequests)
        .select(getNetWorthRequests)
        .next(netWorthRequests)
        .put(syncLocked())
        .next()
        .select(getApiKey)
        .next('my-api-key')
        .put(syncRequested())
        .next()
        .all({
            list: call(updateLists, 'my-api-key', listRequests),
            netWorth: call(updateNetWorth, 'my-api-key', netWorthRequests)
        })
        .next({
            list: resList,
            netWorth: resNetWorth
        })
        .put(syncReceived({
            list: resList,
            netWorth: resNetWorth
        }))
        .next()
        .call(updateCrud, 0, true)
        .next()
        .isDone();

    t.pass();
});

test('updateCrud doesn\'t do anything if there are no requests', t => {
    testSaga(updateCrud)
        .next()
        .select(getCrudRequests)
        .next([])
        .select(getNetWorthRequests)
        .next([])
        .isDone();

    t.pass();
});

test('updateCrud unlocks the sync if there are no requests and the option was set', t => {
    testSaga(updateCrud, 0, true)
        .next()
        .select(getCrudRequests)
        .next([])
        .select(getNetWorthRequests)
        .next([])
        .put(syncUnlocked())
        .next()
        .isDone();

    testSaga(updateCrud, 17, true)
        .next()
        .select(getCrudRequests)
        .next([])
        .select(getNetWorthRequests)
        .next([])
        .put(syncUnlocked())
        .next()
        .isDone();

    testSaga(updateCrud, 3, false)
        .next()
        .select(getCrudRequests)
        .next([])
        .select(getNetWorthRequests)
        .next([])
        .isDone();

    t.pass();
});

test('updateCrud handles API errors using exponential backoff', t => {
    const err = new Error('some api error');

    t.true(API_BACKOFF_TIME > 100);

    const toError = saga => saga
        .next()
        .select(getCrudRequests)
        .next(listRequests)
        .select(getNetWorthRequests)
        .next(netWorthRequests)
        .put(syncLocked())
        .next()
        .select(getApiKey)
        .next('my-api-key')
        .put(syncRequested())
        .next()
        .all({
            list: call(updateLists, 'my-api-key', listRequests),
            netWorth: call(updateNetWorth, 'my-api-key', netWorthRequests)
        })
        .throw(err)
        .put(syncErrorOccurred([...listRequests, ...netWorthRequests], err))
        .next();

    toError(testSaga(updateCrud))
        .delay(API_BACKOFF_TIME)
        .next()
        .call(updateCrud, 1, true)
        .next()
        .isDone();

    toError(testSaga(updateCrud, 1, true))
        .delay(API_BACKOFF_TIME * 3 / 2)
        .next()
        .call(updateCrud, 2, true)
        .next()
        .isDone();

    toError(testSaga(updateCrud, 2, true))
        .delay(API_BACKOFF_TIME * 9 / 4)
        .next()
        .call(updateCrud, 3, true)
        .next()
        .isDone();

    toError(testSaga(updateCrud, 3))
        .delay(API_BACKOFF_TIME * 27 / 8)
        .next()
        .call(updateCrud, 4, true)
        .next()
        .isDone();

    t.pass();
});

test('updateCrudFromAction calls updateCrud', t => {
    testSaga(updateCrudFromAction)
        .next()
        .select(getLocked)
        .next(false)
        .fork(updateCrud)
        .next()
        .isDone();

    t.pass();
});

test('updateCrudFromAction doesn\'t do anything if the sync is locked', t => {
    testSaga(updateCrudFromAction)
        .next()
        .select(getLocked)
        .next(true)
        .isDone();

    t.pass();
});

test('matchCrudAction matches all list actions', t => {
    t.true(matchCrudAction({ type: LIST_ITEM_CREATED }));
    t.true(matchCrudAction({ type: LIST_ITEM_UPDATED }));
    t.true(matchCrudAction({ type: LIST_ITEM_DELETED }));
});

test('matchCrudAction matches all net worth actions', t => {
    t.true(matchCrudAction({ type: NET_WORTH_CATEGORY_CREATED }));
    t.true(matchCrudAction({ type: NET_WORTH_CATEGORY_UPDATED }));
    t.true(matchCrudAction({ type: NET_WORTH_CATEGORY_DELETED }));
    t.true(matchCrudAction({ type: NET_WORTH_SUBCATEGORY_CREATED }));
    t.true(matchCrudAction({ type: NET_WORTH_SUBCATEGORY_UPDATED }));
    t.true(matchCrudAction({ type: NET_WORTH_SUBCATEGORY_DELETED }));
    t.true(matchCrudAction({ type: NET_WORTH_CREATED }));
    t.true(matchCrudAction({ type: NET_WORTH_UPDATED }));
    t.true(matchCrudAction({ type: NET_WORTH_DELETED }));
});

test('crudSaga runs a debounced sync', t => {
    testSaga(crudSaga)
        .next()
        .is(debounce(TIMER_UPDATE_SERVER, matchCrudAction, updateCrudFromAction))
        .next()
        .isDone();

    t.pass();
});
