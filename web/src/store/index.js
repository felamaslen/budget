/* eslint-disable global-require */

let configStore = null;

if (process.env.NODE_ENV === 'development') {
    configStore = require('./configureStore.dev').default;
}
else {
    configStore = require('./configureStore.prod').default;
}

const store = configStore();

export default store;
