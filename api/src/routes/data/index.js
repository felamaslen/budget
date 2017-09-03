const Database = require('../../db');
const authMiddleware = require('../authMiddleware');

const overview = require('./overview').handler;

function handler(app) {
    app.use('/data/*', Database.dbMiddleware, authMiddleware);

    app.get('/data/overview', overview);
}

module.exports = {
    handler
};

