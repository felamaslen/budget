import { CREATE, UPDATE, DELETE } from '~client/constants/data';
import { removeAtIndex, replaceAtIndex } from '~client/modules/data';

function getNextOptimisticStatus(lastStatus, requestType) {
    if (requestType === DELETE) {
        return DELETE;
    }

    return lastStatus || requestType;
}

const getOptimisticUpdateItems = (key, requestType, getNewProps) =>
    (state, action, index) => {
        if (requestType === DELETE && state[key][index].__optimistic === CREATE) {
            return removeAtIndex(state[key], index);
        }

        return replaceAtIndex(state[key], index, {
            ...state[key][index],
            ...getNewProps(action),
            __optimistic: getNextOptimisticStatus(state[key][index].__optimistic, requestType)
        });
    };

const getNewTotals = (key, requestType) => (state, nextItems, index) => {
    const withoutOld = state.total - state[key][index].cost;
    if (requestType === DELETE) {
        return withoutOld;
    }

    return withoutOld + nextItems[index].cost;
};

const withOptimisticUpdate = (
    key = 'items',
    requestType,
    withTotals,
    getNewProps = () => ({})
) => {
    const getItems = getOptimisticUpdateItems(key, requestType, getNewProps);
    const getTotals = getNewTotals(key, requestType);

    return (state, action) => {
        const index = state[key].findIndex(({ id }) => id === action.id);
        if (index === -1) {
            return {};
        }

        const items = getItems(state, action, index);

        if (withTotals) {
            return {
                [key]: items,
                total: getTotals(state, items, index)
            };
        }

        return { [key]: items };
    };
};

export const onCreateOptimistic = (key = 'items', withTotals = false) =>
    (state, { item, fakeId }) => {
        const items = state[key].concat([{ ...item, id: fakeId, __optimistic: CREATE }]);

        if (withTotals) {
            return { [key]: items, total: state.total + item.cost };
        }

        return { [key]: items };
    };

export const onUpdateOptimistic = (key, withTotals) => withOptimisticUpdate(
    key,
    UPDATE,
    withTotals,
    ({ item }) => item
);

export const onDeleteOptimistic = (key, withTotals) => withOptimisticUpdate(
    key,
    DELETE,
    withTotals
);
