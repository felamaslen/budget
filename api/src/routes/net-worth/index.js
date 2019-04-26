const { Router } = require('express');

const { routeCategories } = require('./categories');

function netWorthRoute(config, db) {
    const router = new Router();

    router.use('/categories', routeCategories(db));

    return router;
}

module.exports = {
    netWorthRoute
};
