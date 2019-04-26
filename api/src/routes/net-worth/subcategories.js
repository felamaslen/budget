const { makeCrudRoute } = require('../../modules/crud');
const { mapExternalToInternal, mapInternalToExternal } = require('../../modules/key-map');
const { schemaSubcategory } = require('../../schema/net-worth');

const dbMap = [
    { external: 'categoryId', internal: 'category_id' },
    { external: 'hasCreditLimit', internal: 'has_credit_limit' }
];

const toDb = mapExternalToInternal(dbMap);

const routeSubCategories = makeCrudRoute({
    table: 'net_worth_subcategories',
    item: 'Category',
    schema: schemaSubcategory,
    jsonToDb: (body, params) => toDb({ ...body, ...params }),
    dbToJson: mapInternalToExternal(dbMap)
});

module.exports = {
    routeSubCategories
};
