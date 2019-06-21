const joi = require('joi');
const { Router } = require('express');

const { clientError } = require('../../modules/error-handling');
const { makeCrudRoute, checkItem } = require('../../modules/crud');
const { mapExternalToInternal, mapInternalToExternal } = require('../../modules/key-map');
const { schemaSubcategory } = require('../../schema/net-worth');

const dbMap = [
    { external: 'categoryId', internal: 'category_id' },
    { external: 'hasCreditLimit', internal: 'has_credit_limit' }
];

const toDb = mapExternalToInternal(dbMap);

function routeSubCategories(db) {
    const router = new Router();

    const checkCategoryExists = checkItem(
        db,
        'net_worth_categories',
        'Category',
        req => {
            const { error } = joi.validate(req.body, joi.object({
                categoryId: joi.string()
                    .uuid()
                    .required()
            }).unknown(true));

            if (error) {
                throw clientError(error, 400);
            }

            return req.body.categoryId;
        }
    );

    router.post('/*', checkCategoryExists);
    router.put('/*', checkCategoryExists);

    makeCrudRoute({
        table: 'net_worth_subcategories',
        item: 'Subcategory',
        schema: schemaSubcategory,
        jsonToDb: (body, params) => toDb({ ...body, ...params }),
        dbToJson: mapInternalToExternal(dbMap)
    })(db, router);

    return router;
}

module.exports = {
    routeSubCategories
};
