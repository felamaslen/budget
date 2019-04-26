const { Router } = require('express');

const { authMiddleware } = require('../../modules/auth');
const { routePatch: routeMultipleUpdate } = require('../../middleware/multipleUpdateRequest');

const search = require('../search');

const { netWorthRoute } = require('../net-worth');

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

const dataAll = require('./all');

const pie = require('./pie');
const stocks = require('./stocks');

function handler(config, db, logger) {
    const router = new Router();

    router.use('/*', authMiddleware(config, db, logger));

    router.patch('/multiple', routeMultipleUpdate(config, db, listDataProcessor));

    router.use('/search', search.handler(config, db));

    router.use('/net-worth', netWorthRoute(config, db, logger));

    // cash flow routes
    router.get('/overview', cashflow.routeGet(config, db));
    router.post('/balance', cashflow.routePost(config, db));
    router.put('/balance', cashflow.routePut(config, db));

    // analysis routes
    router.get('/analysis/:period/:groupBy/:pageIndex?', analysis.routeGet(config, db));
    router.get('/analysis/deep/:category/:period/:groupBy/:pageIndex?', analysisDeep.routeGet(config, db));

    // list data routes
    config.data.listCategories.forEach(category => {
        const pageParam = category === 'funds'
            ? ''
            : '/:page?';

        router.get(`/${category}${pageParam}`, listDataProcessor[category].routeGet(config, db));
        router.post(`/${category}`, listDataProcessor[category].routePost(config, db));
        router.put(`/${category}`, listDataProcessor[category].routePut(config, db));
        router.delete(`/${category}`, listDataProcessor[category].routeDelete(config, db));
    });

    router.get('/all', dataAll.routeGet(config, db));

    // pie charts
    router.get('/pie/:category', pie.routeGet(config, db));

    // stocks route
    router.get('/stocks', stocks.routeGet(config, db));

    return router;
}

module.exports = {
    handler
};

