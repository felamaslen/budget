/* eslint-disable global-require */
let configStore = null;
if (process.env.NODE_ENV === 'development') {
  configStore = require('./configureStore.dev').createStore;
} else {
  configStore = require('./configureStore.prod').createStore;
}

export const store = configStore();
