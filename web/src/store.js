/* eslint-disable no-underscore-dangle */
import { createStore, applyMiddleware, compose } from 'redux';
import { combineReducers } from 'redux-immutable';

import {
    TIME_UPDATED, GRAPH_FUNDS_HOVERED, CONTENT_BLOCK_HOVERED,
    ANALYSIS_TREE_HOVERED
} from './constants/actions';

import globalReducer from './reducers/GlobalReducer';

import effectHandler from './effects/handler';

function sideEffectHandler() {
    return store => dispatch => action => {
        dispatch(action);

        if (action.effect && action.effect.type in effectHandler) {
            const reduction = store.getState().get('global');

            effectHandler[action.effect.type](dispatch, reduction, action.effect.payload);
        }
    };
}

const actionsBlacklist = [
    TIME_UPDATED,
    GRAPH_FUNDS_HOVERED,
    CONTENT_BLOCK_HOVERED,
    ANALYSIS_TREE_HOVERED
]

function getStore() {
    const middleware = [sideEffectHandler()];

    const devTools = process.env.NODE_ENV === 'development' &&
        window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

    const composeEnhancers = devTools
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ actionsBlacklist })
        : compose;

    const enhancer = composeEnhancers(
        applyMiddleware(...middleware)
    );

    return createStore(
        combineReducers({
            global: globalReducer
        }),
        enhancer
    );
}

export default getStore;

