import { createStore, applyMiddleware, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import createSagaMiddleware from '@redux-saga/core';

import createReducer, { PreloadedState, State } from '~/reducers';
import rootSaga from '~/sagas';

const sagaMiddleware = createSagaMiddleware();

declare global {
  interface Window {
    __PRELOADED_STATE__?: PreloadedState;
  }
}

const actionsBlacklist = (process.env.SKIP_LOG_ACTIONS || '').split(',');

export default function configureStore(
  preloadedState: PreloadedState | null = null,
  history: History,
  runSaga = true,
): Store<State> {
  const middleware = [routerMiddleware(history)];

  const enhancers = [
    runSaga ? applyMiddleware(sagaMiddleware, ...middleware) : applyMiddleware(...middleware),
  ];

  const composeEnhancers = composeWithDevTools({
    actionsBlacklist,
  });

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
