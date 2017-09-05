const Database = require('../../db');
const authMiddleware = require('../authMiddleware');

const overview = require('./overview').handler;
const analysis = require('./analysis');

function handler(app) {
    app.use('/data/*', Database.dbMiddleware, authMiddleware);

    app.get('/data/overview', overview);
    app.get('/data/analysis/:period/:groupBy/:pageIndex?', analysis.shallow);
    app.get('/data/analysis/deep/:category/:period/:groupBy/:pageIndex?', analysis.deep);
}

module.exports = {
    handler
};

