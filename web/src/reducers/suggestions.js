import { createReducerObject } from 'create-reducer-object';

import {
    SUGGESTIONS_REQUESTED,
    SUGGESTIONS_RECEIVED,
    SUGGESTIONS_CLEARED
} from '~client/constants/actions/suggestions';
import { LOGGED_OUT } from '~client/constants/actions/login';

export const initialState = {
    loading: false,
    list: [],
    next: []
};

const handlers = {
    [LOGGED_OUT]: () => initialState,
    [SUGGESTIONS_REQUESTED]: () => ({ loading: true }),
    [SUGGESTIONS_RECEIVED]: (state, { res: { list = [], nextCategory: next = [] } }) => ({
        loading: false,
        list,
        next
    }),
    [SUGGESTIONS_CLEARED]: () => initialState
};

export default createReducerObject(handlers, initialState);
