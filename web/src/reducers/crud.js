import { CREATE, UPDATE, DELETE } from '~client/constants/data';
import { replaceAtIndex } from '~client/modules/data';

const withOptimisticUpdate = (key = 'items', requestType, getNewProps = () => ({})) =>
    (state, action) => {
        const index = state[key].findIndex(({ id }) => id === action.id);
        if (index === -1) {
            return {};
        }

        return {
            [key]: replaceAtIndex(state[key], index, {
                ...state[key][index],
                ...getNewProps(action),
                __optimistic: state[key][index].__optimistic || requestType
            })
        };
    };

export const onCreateOptimistic = (key = 'items') =>
    (state, { item, fakeId }) => ({
        [key]: state[key].concat([{ ...item, id: fakeId, __optimistic: CREATE }])
    });

export const onUpdateOptimistic = key => withOptimisticUpdate(key, UPDATE, ({ item }) => item);

export const onDeleteOptimistic = key => withOptimisticUpdate(key, DELETE);
