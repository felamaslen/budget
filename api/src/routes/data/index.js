const Database = require('../../db');
const authMiddleware = require('../../authMiddleware');

const config = require('../../config')();

const cashflow = require('./cashflow');
const analysis = require('./analysis');
const analysisDeep = require('./analysis/deep');

const income = require('./income');
const bills = require('./bills');
const funds = require('./funds');
const food = require('./food');
const general = require('./general');
const social = require('./social');
const holiday = require('./holiday');

const listDataProcessor = { income, bills, funds, food, general, social, holiday };

const stocks = require('./stocks');

function handler(app) {
    // all of the following routes require database and authentication middleware
    app.use('/data/*', Database.dbMiddleware, authMiddleware.authMiddleware);

    // cash flow routes
    app.get('/data/overview', cashflow.routeGet);
    app.post('/data/balance', cashflow.routePost);
    app.put('/data/balance', cashflow.routePut);

    // analysis routes
    app.get('/data/analysis/:period/:groupBy/:pageIndex?', analysis.routeGet);
    app.get('/data/analysis/deep/:category/:period/:groupBy/:pageIndex?', analysisDeep.routeGet);

    // list data routes
    config.data.listCategories.forEach(category => {
        const pageParam = category === 'funds'
            ? ''
            : '/:page?';

        app.get(`/data/${category}${pageParam}`, listDataProcessor[category].routeGet);
        app.post(`/data/${category}`, listDataProcessor[category].routePost);
        app.put(`/data/${category}`, listDataProcessor[category].routePut);
        app.delete(`/data/${category}`, listDataProcessor[category].routeDelete);
    });

    // stocks route
    app.get('/data/stocks', stocks.routeGet);
}

module.exports = {
    handler
};

