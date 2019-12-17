import { compose, createStore, applyMiddleware, Store } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import createSagaMiddleware from '@redux-saga/core';

import createReducer, { State, PreloadedState } from '~/reducers';
import rootSaga from '~/sagas';

const sagaMiddleware = createSagaMiddleware();

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    __PRELOADED_STATE__?: PreloadedState;
  }
}

export default function configureStore(
  preloadedState: PreloadedState | null = null,
  history: History,
  runSaga = true,
): Store<State> {
  const middleware = [routerMiddleware(history)];

  const enhancers = [
    runSaga ? applyMiddleware(sagaMiddleware, ...middleware) : applyMiddleware(...middleware),
  ];

  const composeEnhancers =
    typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const state = preloadedState || window.__PRELOADED_STATE__ || {};
  const store = createStore(createReducer(history), state, composeEnhancers(...enhancers));

  if (runSaga) {
    sagaMiddleware.run(rootSaga);
  }

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createReducer(history));
      store.dispatch({ type: '@@REDUCER_INJECTED' });
    });
  }

  return store;
}
