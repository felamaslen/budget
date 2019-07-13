/* eslint-disable prefer-reflect */
import test from 'ava';
import { testSaga } from 'redux-saga-test-plan';
import { debounce } from 'redux-saga/effects';
import axios from 'axios';

import crudSaga, {
    updateCrud
} from '~client/sagas/crud';
import { getApiKey } from '~client/selectors/api';
import { getCrudRequests } from '~client/selectors/list';
import { syncRequested, syncReceived, syncErrorOccurred } from '~client/actions/api';
import {
    LIST_ITEM_CREATED,
    LIST_ITEM_UPDATED,
    LIST_ITEM_DELETED
} from '~client/constants/actions/list';
import {
    CREATE,
    UPDATE,
    DELETE,
    API_PREFIX,
    API_BACKOFF_TIME,
    TIMER_UPDATE_SERVER
} from '~client/constants/data';

const requests = [
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

const httpRequests = [
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

test('updateCrud calls the API with a request list', t => {
    const res = { data: { data: { isRes: true } } };

    testSaga(updateCrud)
        .next()
        .select(getCrudRequests)
        .next(requests)
        .select(getApiKey)
        .next('my-api-key')
        .put(syncRequested())
        .next()
        .call(axios.patch, `${API_PREFIX}/data/multiple`, {
            list: httpRequests
        }, {
            headers: { Authorization: 'my-api-key' }
        })
        .next(res)
        .put(syncReceived(requests, res.data.data))
        .next()
        .isDone();

    t.pass();
});

test('updateCrud doesn\'t do anything if there are no requests', t => {
    testSaga(updateCrud)
        .next()
        .select(getCrudRequests)
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
        .next(requests)
        .select(getApiKey)
        .next('my-api-key')
        .put(syncRequested())
        .next()
        .call(axios.patch, `${API_PREFIX}/data/multiple`, {
            list: httpRequests
        }, {
            headers: { Authorization: 'my-api-key' }
        })
        .throw(err);

    const action = { some: 'action' };

    toError(testSaga(updateCrud, action))
        .put(syncErrorOccurred(requests, err))
        .next()
        .delay(API_BACKOFF_TIME)
        .next()
        .call(updateCrud, action, 1)
        .next()
        .isDone();

    toError(testSaga(updateCrud, action, 1))
        .put(syncErrorOccurred(requests, err))
        .next()
        .delay(API_BACKOFF_TIME * 3 / 2)
        .next()
        .call(updateCrud, action, 2)
        .next()
        .isDone();

    toError(testSaga(updateCrud, action, 2))
        .put(syncErrorOccurred(requests, err))
        .next()
        .delay(API_BACKOFF_TIME * 9 / 4)
        .next()
        .call(updateCrud, action, 3)
        .next()
        .isDone();

    toError(testSaga(updateCrud, action, 3))
        .put(syncErrorOccurred(requests, err))
        .next()
        .delay(API_BACKOFF_TIME * 27 / 8)
        .next()
        .call(updateCrud, action, 4)
        .next()
        .isDone();

    t.pass();
});

test('crudSaga runs a debounced sync in response to CRUD actions', t => {
    testSaga(crudSaga)
        .next()
        .is(debounce(TIMER_UPDATE_SERVER, [
            LIST_ITEM_CREATED,
            LIST_ITEM_UPDATED,
            LIST_ITEM_DELETED
        ], updateCrud))
        .next()
        .isDone();

    t.pass();
});
