import { applyMiddleware, createStore, Store, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import rootReducer, { State } from '~client/reducers';
import rootSaga from '~client/sagas';

const sagaMiddleware = createSagaMiddleware();

const createProdStore = (): Store<State> => {
  const store = compose(applyMiddleware(sagaMiddleware))(createStore)(rootReducer);

  sagaMiddleware.run(rootSaga);

  return store;
};
export { createProdStore as createStore };
