const { Router } = require('express');

const { validate } = require('../../modules/validate');
const { schemaNetWorth } = require('../../schema/net-worth');
const { routeCategories } = require('./categories');
const { routeSubCategories } = require('./subcategories');

const { onCreate } = require('./create');
const { onRead } = require('./read');
const { onDelete } = require('./delete');

function netWorthRoute(config, db) {
    const router = new Router();

    router.use('/categories', routeCategories(db));
    router.use('/subcategories', routeSubCategories(db));

    router.post('/', validate(schemaNetWorth), onCreate(db));

    router.get('/:id?', onRead(db));

    router.delete('/:id', onDelete(db));

    return router;
}

module.exports = {
    netWorthRoute
};
