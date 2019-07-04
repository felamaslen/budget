import { createReducerObject } from 'create-reducer-object';

import {
    ERROR_OPENED,
    ERROR_CLOSED,
    ERROR_REMOVED
} from '~client/constants/actions/error';

import { replaceAtIndex } from '~client/modules/data';

export const initialState = [];

const onClose = (state, { id }) => replaceAtIndex(
    state,
    state.findIndex(({ id: messageId }) => messageId === id),
    value => ({ ...value, closed: true }),
    true
);

const handlers = {
    [ERROR_OPENED]: (state, { id, message }) => state.concat([{ id, message }]),
    [ERROR_CLOSED]: onClose,
    [ERROR_REMOVED]: (state, { id }) => state.filter(({ id: messageId }) => messageId !== id)
};

export default createReducerObject(handlers, initialState);
