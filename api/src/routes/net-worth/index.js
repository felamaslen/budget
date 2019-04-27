const { Router } = require('express');

const { routeCategories } = require('./categories');
const { routeSubCategories } = require('./subcategories');

function netWorthRoute(config, db) {
    const router = new Router();

    router.use('/categories', routeCategories(db));

    router.use('/subcategories', routeSubCategories(db));

    return router;
}

module.exports = {
    netWorthRoute
};
