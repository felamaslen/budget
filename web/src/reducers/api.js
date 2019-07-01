import { createReducerObject } from 'create-reducer-object';

import {
    SYNC_REQUESTED,
    SYNC_RECEIVED
} from '~client/constants/actions/api';
import { LOGGED_OUT } from '~client/constants/actions/login';

export const initialState = {
    loading: false,
    error: null
};

const handlers = {
    [SYNC_REQUESTED]: () => ({ loading: true }),
    [SYNC_RECEIVED]: (state, { err }) => ({
        loading: false,
        error: err
    }),
    [LOGGED_OUT]: () => initialState
};

export default createReducerObject(handlers, initialState);
