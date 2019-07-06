import { createReducerObject } from 'create-reducer-object';

import {
    SYNC_REQUESTED,
    SYNC_RECEIVED,
    SYNC_ERROR_OCCURRED
} from '~client/constants/actions/api';
import { LOGGED_IN, LOGGED_OUT } from '~client/constants/actions/login';

export const initialState = {
    loading: false,
    error: null,
    key: null
};

const handlers = {
    [SYNC_REQUESTED]: () => ({ loading: true }),
    [SYNC_RECEIVED]: () => ({ loading: false, error: null }),
    [SYNC_ERROR_OCCURRED]: (state, { err }) => ({ loading: false, error: err }),
    [LOGGED_IN]: (state, { res: { apiKey } }) => ({ key: apiKey }),
    [LOGGED_OUT]: () => initialState
};

export default createReducerObject(handlers, initialState);
