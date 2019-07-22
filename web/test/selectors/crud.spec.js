import test from 'ava';

import { CREATE, UPDATE, DELETE } from '~client/constants/data';
import {
    getRequests
} from '~client/selectors/crud';

test('getRequests gets create requests', t => {
    const items = [
        {
            id: 'some-fake-id',
            foo: 'bar',
            bar: 'baz',
            __optimistic: CREATE
        }
    ];

    const result = getRequests('my/url/something')(items);

    t.deepEqual(result, [{
        type: CREATE,
        fakeId: 'some-fake-id',
        method: 'post',
        route: 'my/url/something',
        body: {
            foo: 'bar',
            bar: 'baz'
        }
    }]);
});

test('getRequests gets update requests', t => {
    const items = [
        {
            id: 'some-real-id',
            foo: 'bar',
            bar: 'baz',
            __optimistic: UPDATE
        }
    ];

    const result = getRequests('my/url/something')(items);

    t.deepEqual(result, [{
        type: UPDATE,
        id: 'some-real-id',
        method: 'put',
        route: 'my/url/something',
        body: {
            foo: 'bar',
            bar: 'baz'
        }
    }]);
});

test('getRequests gets delete requests', t => {
    const items = [
        {
            id: 'some-real-id',
            __optimistic: DELETE
        }
    ];

    const result = getRequests('my/url/something')(items);

    t.deepEqual(result, [{
        type: DELETE,
        id: 'some-real-id',
        method: 'delete',
        route: 'my/url/something'
    }]);
});
