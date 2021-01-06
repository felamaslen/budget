import { createStore, Store } from 'redux';

import rootReducer, { State } from '~client/reducers';

const createProdStore = (preloadedState?: State): Store<State> =>
  createStore(rootReducer, preloadedState);

// ts-prune-ignore-next
export { createProdStore as createStore };
