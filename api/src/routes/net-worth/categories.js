const { makeCrudRoute, checkItem } = require('../../modules/crud');
const { schemaCategory } = require('../../schema/net-worth');

const { routeSubCategories } = require('./subcategories');

function routeCategories(db) {
    const table = 'net_worth_categories';
    const item = 'Category';

    const route = makeCrudRoute({
        table,
        item,
        schema: schemaCategory
    })(db);

    route.use('/:id/*', checkItem(db, table, item));

    routeSubCategories(db, route, '/:categoryId/subcategories');

    return route;
}

module.exports = {
    routeCategories
};
