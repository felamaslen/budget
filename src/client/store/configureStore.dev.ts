/* eslint-disable no-underscore-dangle, global-require, @typescript-eslint/no-var-requires */
import { applyMiddleware, createStore, Store, compose } from 'redux';
import { createLogger } from 'redux-logger';

import { Action } from '~client/actions';
import rootReducer, { State } from '~client/reducers';

const SKIP_LOG_ACTIONS = (process.env.SKIP_LOG_ACTIONS || '').split(',');

const logger = createLogger({
  collapsed: true,
  predicate: (_, action: Action) => SKIP_LOG_ACTIONS.indexOf(action.type) === -1,
});

const createDevStore = (preloadedState?: State): Store<State> => {
  const enhancers = [
    applyMiddleware(logger),
    window.__REDUX_DEVTOOLS_EXTENSION__?.({
      actionsBlacklist: SKIP_LOG_ACTIONS,
    }),
  ].filter(Boolean);

  const store = createStore<State, Action, unknown, unknown>(
    rootReducer,
    preloadedState,
    compose(...enhancers),
  );

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      store.replaceReducer(require('../reducers').default);
    });
  }

  return store;
};
// ts-prune-ignore-next
export { createDevStore as createStore };
