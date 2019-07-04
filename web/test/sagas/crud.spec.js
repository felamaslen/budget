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
import { API_PREFIX, TIMER_UPDATE_SERVER } from '~client/constants/data';

const requests = [
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
    t.is(1, 1);

    const res = { isRes: true };

    testSaga(updateCrud)
        .next()
        .select(getCrudRequests)
        .next(requests)
        .select(getApiKey)
        .next('my-api-key')
        .put(syncRequested())
        .next()
        .call(axios.patch, `${API_PREFIX}/data/multiple`, {
            list: requests
        }, {
            headers: { Authorization: 'my-api-key' }
        })
        .next(res)
        .put(syncReceived(requests, res))
        .next()
        .isDone();
});

test('updateCrud handles API errors', t => {
    t.is(1, 1);

    const err = new Error('some api error');

    testSaga(updateCrud)
        .next()
        .select(getCrudRequests)
        .next(requests)
        .select(getApiKey)
        .next('my-api-key')
        .put(syncRequested())
        .next()
        .call(axios.patch, `${API_PREFIX}/data/multiple`, {
            list: requests
        }, {
            headers: { Authorization: 'my-api-key' }
        })
        .throw(err)
        .put(syncErrorOccurred(requests, err))
        .next()
        .isDone();
});

test('crudSaga runs a debounced sync in response to CRUD actions', t => {
    t.is(1, 1);
    testSaga(crudSaga)
        .next()
        .is(debounce(TIMER_UPDATE_SERVER, [
            LIST_ITEM_CREATED,
            LIST_ITEM_UPDATED,
            LIST_ITEM_DELETED
        ], updateCrud))
        .next()
        .isDone();
});
