import { compose, createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import createSagaMiddleware from '@redux-saga/core';

import createReducer, { PreloadedState } from '~/reducers';
import rootSaga from '~/sagas';

const sagaMiddleware = createSagaMiddleware();

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

export default function configureStore(preloadedState: PreloadedState = {}, history: History) {
  const middleware = [sagaMiddleware, routerMiddleware(history)];

  const enhancers = [applyMiddleware(...middleware)];

  const composeEnhancers =
    typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const store = createStore(createReducer(history), preloadedState, composeEnhancers(...enhancers));

  sagaMiddleware.run(rootSaga);

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createReducer(history));
      store.dispatch({ type: '@@REDUCER_INJECTED' });
    });
  }

  return store;
}
