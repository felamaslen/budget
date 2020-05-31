/* eslint-disable no-underscore-dangle, global-require */
import { applyMiddleware, createStore, Store, compose } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';

import { Action } from '~client/actions';
import rootReducer, { State } from '~client/reducers';
import rootSaga from '~client/sagas';

const sagaMiddleware = createSagaMiddleware();

const SKIP_LOG_ACTIONS = (process.env.SKIP_LOG_ACTIONS || '').split(',');

const logger = createLogger({
  collapsed: true,
  predicate: (_, action: Action) => SKIP_LOG_ACTIONS.indexOf(action.type) === -1,
});

const createDevStore = (): Store<State> => {
  const store = compose(applyMiddleware(sagaMiddleware, logger))(createStore)<State, Action>(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__({
        actionsBlacklist: SKIP_LOG_ACTIONS,
      }),
  );

  sagaMiddleware.run(rootSaga);

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      store.replaceReducer(require('../reducers').default);
    });
  }

  return store;
};
export { createDevStore as createStore };
