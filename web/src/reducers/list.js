import compose from 'just-compose';
import { createReducerObject } from 'create-reducer-object';

import {
    LIST_ITEM_CREATED,
    LIST_ITEM_UPDATED,
    LIST_ITEM_DELETED,
} from '~client/constants/actions/list';

import { LOGGED_OUT } from '~client/constants/actions/login';
import { DATA_READ, SYNC_RECEIVED } from '~client/constants/actions/api';

import {
    PAGES, DATA_KEY_ABBR, CREATE, UPDATE, DELETE,
} from '~client/constants/data';
import { replaceAtIndex, getValueFromTransmit } from '~client/modules/data';

import { onCreateOptimistic, onUpdateOptimistic, onDeleteOptimistic } from '~client/reducers/crud';

const filterByPage = (thisPage, handler) => (state, { page, ...action }) => {
    if (page !== thisPage) {
        return {};
    }

    return handler(state, action);
};

export const onRead = (page) => (state, { res }) => {
    if (!res[page]) {
        return {};
    }
    if (!res[page].data.length) {
        return { items: [] };
    }

    const dataKeys = Object.keys(DATA_KEY_ABBR)
        .filter((longKey) => typeof res[page].data[0][DATA_KEY_ABBR[longKey]] !== 'undefined');

    const items = res[page].data.map((item) => dataKeys.reduce((last, longKey) => ({
        ...last,
        [longKey]: getValueFromTransmit(longKey, item[DATA_KEY_ABBR[longKey]]),
    }), {}));

    return { items };
};

function filterRequestItems(requestType, postProcess, idKey = 'id') {
    return (requestItems) => (items) => postProcess(items, requestItems
        .filter(({ request: { type } }) => type === requestType)
        .map(({ request, index, res }) => ({
            request,
            index,
            res,
            listIndex: items.findIndex(({ id, __optimistic }) => __optimistic === requestType
                && id === request[idKey]),
        })));
}

const withCreatedIds = (items, requestItems) => requestItems
    .reduce((last, { res, listIndex }) => replaceAtIndex(last, listIndex, (value) => ({
        ...value,
        id: res.id || value.id,
        __optimistic: null,
    }), true), items);

const confirmCreates = filterRequestItems(CREATE, withCreatedIds, 'fakeId');

const confirmUpdates = filterRequestItems(UPDATE, withCreatedIds);

const confirmDeletes = filterRequestItems(DELETE, (items, requestItems) => {
    const idsToDelete = requestItems.map(({ request: { id } }) => id);

    return items.filter(({ id }) => !idsToDelete.includes(id));
});

const onSyncReceived = (page) => (state, { res: { list } }) => {
    const requestItems = list
        .map(({ res, ...request }, index) => ({ request, index, res }))
        .filter(({ request }) => request.route === page);

    const items = compose(
        confirmCreates(requestItems),
        confirmUpdates(requestItems),
        confirmDeletes(requestItems),
    )(state.items);

    const total = requestItems.reduce((last, { res: { total: next = last } = {} }) => next, state.total);

    return { items, total };
};

export default function makeListReducer(page, extraHandlers = {}, extraState = {}, withTotals = false) {
    const initialState = {
        ...extraState,
        items: [],
    };

    const columns = PAGES[page].cols;

    const handlers = {
        [LOGGED_OUT]: () => initialState,
        [DATA_READ]: onRead(page),
        [LIST_ITEM_CREATED]: filterByPage(page, onCreateOptimistic('items', columns, withTotals)),
        [LIST_ITEM_UPDATED]: filterByPage(page, onUpdateOptimistic('items', columns, withTotals)),
        [LIST_ITEM_DELETED]: filterByPage(page, onDeleteOptimistic('items', withTotals)),
        [SYNC_RECEIVED]: onSyncReceived(page),
        ...extraHandlers,
    };

    return createReducerObject(handlers, initialState);
}

export function makeDailyListReducer(page, extraHandlers = {}) {
    const dataOnRead = onRead(page);

    const listOnRead = (state, action) => {
        const {
            res: {
                [page]: pageRes = { total: 0, olderExists: null },
            },
        } = action;

        const {
            total,
            olderExists,
        } = pageRes;

        return { ...dataOnRead(state, action), total, olderExists };
    };

    return makeListReducer(page, {
        ...extraHandlers,
        [DATA_READ]: listOnRead,
    }, {
        total: 0,
        olderExists: null,
    }, true);
}
