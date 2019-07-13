import { CREATE, UPDATE, DELETE } from '~client/constants/data';
import { removeAtIndex, replaceAtIndex } from '~client/modules/data';

function getNextOptimisticStatus(lastStatus, requestType) {
    if (requestType === DELETE) {
        return DELETE;
    }

    return lastStatus || requestType;
}

const withOptimisticUpdate = (key = 'items', requestType, getNewProps = () => ({})) =>
    (state, action) => {
        const index = state[key].findIndex(({ id }) => id === action.id);
        if (index === -1) {
            return {};
        }
        if (requestType === DELETE && state[key][index].__optimistic === CREATE) {
            return { [key]: removeAtIndex(state[key], index) };
        }

        return {
            [key]: replaceAtIndex(state[key], index, {
                ...state[key][index],
                ...getNewProps(action),
                __optimistic: getNextOptimisticStatus(state[key][index].__optimistic, requestType)
            })
        };
    };

export const onCreateOptimistic = (key = 'items') =>
    (state, { item, fakeId }) => ({
        [key]: state[key].concat([{ ...item, id: fakeId, __optimistic: CREATE }])
    });

export const onUpdateOptimistic = key => withOptimisticUpdate(key, UPDATE, ({ item }) => item);

export const onDeleteOptimistic = key => withOptimisticUpdate(key, DELETE);
