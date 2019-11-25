import { createReducerObject } from 'create-reducer-object';

import {
    WINDOW_RESIZED,
} from '~client/constants/actions/app';
import { LOGGED_OUT } from '~client/constants/actions/login';

export const initialState = {
    windowWidth: window.innerWidth,
};

const onWindowResize = (state, { size }) => ({ windowWidth: size });

const handlers = {
    [WINDOW_RESIZED]: onWindowResize,
    [LOGGED_OUT]: () => initialState,
};

export default createReducerObject(handlers, initialState);
