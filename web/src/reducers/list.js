import compose from 'just-compose';
import { createReducerObject } from 'create-reducer-object';

import {
    LIST_ITEM_CREATED,
    LIST_ITEM_UPDATED,
    LIST_ITEM_DELETED
} from '~client/constants/actions/list';

import { LOGGED_OUT } from '~client/constants/actions/login';
import { DATA_READ, SYNC_RECEIVED } from '~client/constants/actions/api';

import { DATA_KEY_ABBR, CREATE, UPDATE, DELETE } from '~client/constants/data';
import { replaceAtIndex } from '~client/modules/data';

export const onRead = page => (state, { res }) => {
    if (!res[page]) {
        return {};
    }
    if (!res[page].data.length) {
        return { items: [] };
    }

    const dataKeys = Object.keys(DATA_KEY_ABBR)
        .filter(longKey => typeof res[page].data[0][DATA_KEY_ABBR[longKey]] !== 'undefined');

    const items = res[page].data.map(item =>
        dataKeys.reduce((last, longKey) => ({ ...last, [longKey]: item[DATA_KEY_ABBR[longKey]] }), {})
    );

    return { items };
};

function withOptimisticUpdate(requestType, getNewProps = () => ({})) {
    return thisPage => (state, { page, ...action }) => {
        if (page !== thisPage) {
            return {};
        }

        const index = state.items.findIndex(({ id }) => id === action.id);
        if (index === -1) {
            return {};
        }

        return {
            items: replaceAtIndex(state.items, index, {
                ...state.items[index],
                ...getNewProps(action),
                __optimistic: requestType
            })
        };
    };
}

const onCreateOptimistic = thisPage => (state, { page, item, fakeId }) => {
    if (page !== thisPage) {
        return {};
    }

    return { items: state.items.concat([{ ...item, id: fakeId, __optimistic: CREATE }]) };
};

const onUpdateOptimistic = withOptimisticUpdate(UPDATE, ({ item }) => item);

const onDeleteOptimistic = withOptimisticUpdate(DELETE);

function filterRequestItems(requestType, postProcess, idKey = 'id') {
    return requestItems => items => postProcess(items, requestItems
        .filter(({ request: { type } }) => type === requestType)
        .map(({ request, index, res }) => ({
            request,
            index,
            res,
            listIndex: items.findIndex(({ id, __optimistic }) =>
                __optimistic === requestType &&
                id === request[idKey]
            )
        }))
    );
}

const withCreatedIds = (items, requestItems) => requestItems
    .reduce((last, { res, listIndex }) => replaceAtIndex(last, listIndex, value => ({
        ...value,
        id: res.id,
        __optimistic: null
    }), true), items);

const confirmCreates = filterRequestItems(CREATE, withCreatedIds, 'fakeId');

const confirmUpdates = filterRequestItems(UPDATE, withCreatedIds);

const confirmDeletes = filterRequestItems(DELETE, (items, requestItems) => {
    const idsToDelete = requestItems.map(({ request: { id } }) => id);

    return items.filter(({ id }) => !idsToDelete.includes(id));
});

const onSyncReceived = page => (state, { requests, res }) => {
    const requestItems = requests
        .map((request, index) => ({ request, index, res: res[index] }))
        .filter(({ request }) => request.page === page);

    const items = compose(
        confirmCreates(requestItems),
        confirmUpdates(requestItems),
        confirmDeletes(requestItems)
    )(state.items);

    return { items };
};

export default function makeListReducer(page, extraHandlers, extraState) {
    const initialState = {
        ...extraState,
        items: []
    };

    const handlers = {
        [LOGGED_OUT]: () => initialState,
        [DATA_READ]: onRead(page),
        [LIST_ITEM_CREATED]: onCreateOptimistic(page),
        [LIST_ITEM_UPDATED]: onUpdateOptimistic(page),
        [LIST_ITEM_DELETED]: onDeleteOptimistic(page),
        [SYNC_RECEIVED]: onSyncReceived(page),
        ...extraHandlers
    };

    return createReducerObject(handlers, initialState);
}
