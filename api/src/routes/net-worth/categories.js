const { makeCrudRoute } = require('../../modules/crud');
const { schemaCategory } = require('../../schema/net-worth');

const routeCategories = makeCrudRoute({
    table: 'net_worth_categories',
    item: 'Category',
    schema: schemaCategory
});

module.exports = {
    routeCategories
};
