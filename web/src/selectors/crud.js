import compose from 'just-compose';

import { CREATE, UPDATE, DELETE } from '~client/constants/data';

const filterByType = (type, method, idKey) => (route, items) => requests => requests.concat(items
    .filter(({ __optimistic }) => __optimistic === type)
    .map(({ __optimistic, id, ...body }) => ({
        type,
        [idKey]: id,
        method,
        route,
        body
    }))
);

const withCreates = filterByType(CREATE, 'post', 'fakeId');

const withUpdates = filterByType(UPDATE, 'put', 'id');

const withDeletes = (route, items) => requests => requests.concat(items
    .filter(({ __optimistic }) => __optimistic === DELETE)
    .map(({ id }) => ({
        type: DELETE,
        id,
        method: 'delete',
        route
    }))
);

export const getRequests = route => items => compose(
    withCreates(route, items),
    withUpdates(route, items),
    withDeletes(route, items)
)([]);
