import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import rootSaga from '../sagas';
import rootReducer from '../reducers';

const sagaMiddleware = createSagaMiddleware();

export default initialState => {
    const createStoreWithMiddleware = applyMiddleware(sagaMiddleware)(createStore);

    const store = createStoreWithMiddleware(rootReducer, initialState);

    sagaMiddleware.run(rootSaga);

    return store;
};

