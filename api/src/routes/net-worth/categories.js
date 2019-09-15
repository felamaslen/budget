const { makeCrudRoute } = require('../../modules/crud');
const { schemaCategory } = require('../../schema/net-worth');

function routeCategories(db) {
    const table = 'net_worth_categories';
    const item = 'Category';

    const route = makeCrudRoute({
        table,
        item,
        schema: schemaCategory,
    })(db);

    return route;
}

module.exports = {
    routeCategories,
};
