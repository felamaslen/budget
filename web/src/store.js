/* eslint-disable no-underscore-dangle */
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { combineReducers } from 'redux-immutable';

import globalReducer from './reducers/GlobalReducer';

function getStore() {
    const middleware = [thunk];

    const devTools = process.env.NODE_ENV === 'development' &&
        window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

    const composeEnhancers = devTools
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
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

