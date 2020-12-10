/* eslint-disable global-require, @typescript-eslint/no-var-requires */
import { Store } from 'redux';
import { Action } from '~client/actions';
import { State } from '~client/reducers';

let configStore = null;
if (process.env.NODE_ENV === 'development') {
  configStore = require('./configureStore.dev').createStore;
} else {
  configStore = require('./configureStore.prod').createStore;
}

export const store: Store<State, Action> = configStore();
