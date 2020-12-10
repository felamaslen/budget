import { createStore, Store } from 'redux';

import rootReducer, { State } from '~client/reducers';

const createProdStore = (): Store<State> => {
  const store = createStore(rootReducer);

  return store;
};
// ts-prune-ignore-next
export { createProdStore as createStore };
