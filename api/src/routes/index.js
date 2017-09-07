const data = require('./data');
const search = require('./search');
const user = require('./user');

function handler(router) {
    user(router);
    data(router);
    search(router);
}

module.exports = handler;

