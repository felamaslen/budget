import { applyMiddleware, createStore, Store, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { Action } from '~client/actions';
import rootReducer, { State } from '~client/reducers';
import rootSaga from '~client/sagas';

const sagaMiddleware = createSagaMiddleware();

const createProdStore = (): Store<State> => {
  const store = compose(applyMiddleware(sagaMiddleware))(createStore)<State, Action>(rootReducer);

  sagaMiddleware.run(rootSaga);

  return store;
};
// ts-prune-ignore-next
export { createProdStore as createStore };
