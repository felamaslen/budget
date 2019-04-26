const { Router } = require('express');

const { routeCategories } = require('./categories');

function netWorthRoute(config, db, logger) {
    const router = new Router();

    router.use('/categories', routeCategories(config, db, logger));

    return router;
}

module.exports = {
    netWorthRoute
};
