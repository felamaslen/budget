import { createReducerObject } from 'create-reducer-object';

import {
    DATA_READ,
    SYNC_REQUESTED,
    SYNC_RECEIVED,
    SYNC_ERROR_OCCURRED
} from '~client/constants/actions/api';
import { LOGGED_IN, LOGGED_OUT } from '~client/constants/actions/login';

export const initialState = {
    loading: false,
    initialLoading: false,
    error: null,
    key: null
};

const handlers = {
    [DATA_READ]: () => ({ initialLoading: false }),
    [SYNC_REQUESTED]: () => ({ loading: true }),
    [SYNC_RECEIVED]: () => ({ loading: false, error: null }),
    [SYNC_ERROR_OCCURRED]: (state, { err }) => ({ loading: false, error: err }),
    [LOGGED_IN]: (state, { res: { apiKey } }) => ({ key: apiKey, initialLoading: true }),
    [LOGGED_OUT]: () => initialState
};

export default createReducerObject(handlers, initialState);
