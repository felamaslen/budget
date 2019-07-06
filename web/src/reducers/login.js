import { createReducerObject } from 'create-reducer-object';

import {
    LOGIN_REQUESTED,
    LOGIN_ERROR_OCCURRED,
    LOGGED_IN,
    LOGGED_OUT
} from '~client/constants/actions/login';

export const initialState = {
    initialised: false,
    loading: false,
    error: null,
    uid: null,
    name: null
};

const handlers = {
    [LOGIN_REQUESTED]: () => ({ loading: true }),
    [LOGIN_ERROR_OCCURRED]: (state, { err }) => ({
        initialised: true,
        loading: false,
        error: err
    }),
    [LOGGED_IN]: (state, { res: { uid, name } }) => ({
        initialised: true,
        loading: false,
        error: null,
        uid,
        name
    }),
    [LOGGED_OUT]: () => ({
        ...initialState,
        initialised: true
    })
};

export default createReducerObject(handlers, initialState);
