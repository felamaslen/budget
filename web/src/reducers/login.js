import { createReducerObject } from 'create-reducer-object';

import {
    LOGIN_REQUESTED,
    LOGIN_ERROR_OCCURRED,
    LOGGED_IN,
    LOGGED_OUT
} from '~client/constants/actions/login';

export const initialState = {
    loading: false,
    error: null,
    user: null
};

const handlers = {
    [LOGIN_REQUESTED]: () => ({ loading: true }),
    [LOGIN_ERROR_OCCURRED]: (state, { err }) => ({ loading: false, error: err }),
    [LOGGED_IN]: (state, { res: { uid, name } }) => ({
        loading: false,
        error: null,
        user: { uid, name }
    }),
    [LOGGED_OUT]: () => initialState
};

export default createReducerObject(handlers, initialState);
