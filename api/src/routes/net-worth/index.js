const { Router } = require('express');

const { validate } = require('../../modules/validate');
const { clientError, catchAsyncErrors } = require('../../modules/error-handling');
const { schemaNetWorth } = require('../../schema/net-worth');
const { routeCategories } = require('./categories');
const { routeSubCategories } = require('./subcategories');

const { onCreate } = require('./create');
const { onRead } = require('./read');
const { onUpdate } = require('./update');
const { onDelete } = require('./delete');

const unionSelectIds = (db, categories, after) => {
    if (!categories.length) {
        return [];
    }

    return db.raw(`
    SELECT ids.id
    FROM (
        SELECT '${categories[0]}'::uuid AS id
        ${categories.slice(1)
        .map((id) => `UNION SELECT '${id}'::uuid`)
        .join('\n')}
    ) AS ids
    ${after}
    `);
};

function validateCategories(db) {
    return catchAsyncErrors(async (req, res, next) => {
        const valuesCategories = req.validBody.values.map(({ subcategory }) => subcategory);
        const creditLimitCategories = req.validBody.creditLimit.map(({ subcategory }) => subcategory);

        const allSubCategories = valuesCategories.concat(creditLimitCategories);

        const invalidIds = await unionSelectIds(db, allSubCategories, `
        LEFT JOIN net_worth_subcategories AS nws ON nws.id = ids.id
        WHERE nws.id IS NULL
        `);

        if (invalidIds.length) {
            throw clientError(`Nonexistent subcategory IDs: ${
                invalidIds.map(({ id }) => id).join(',')
            }`, 404);
        }

        const invalidCreditCategories = await unionSelectIds(db, creditLimitCategories, `
        LEFT JOIN net_worth_subcategories AS nws ON nws.id = ids.id
        LEFT JOIN net_worth_categories AS nwc ON nwc.id = nws.category_id
        WHERE nwc.id IS NULL
            OR nws.has_credit_limit != TRUE
            OR nwc.id IS NULL
            OR nwc.type != 'liability'
        `);

        if (invalidCreditCategories.length) {
            throw clientError(`Tried to add credit limit to non-credit subcategory: ${
                invalidCreditCategories.map(({ id }) => id).join(',')
            }`, 400);
        }

        if (Array.from(new Set(creditLimitCategories)).length !== creditLimitCategories.length) {
            throw clientError('Duplicate credit limit subcategories', 400);
        }

        return next();
    });
}

function netWorthRoute(config, db) {
    const router = new Router();

    router.use('/categories', routeCategories(db));
    router.use('/subcategories', routeSubCategories(db));

    router.post('/', validate(schemaNetWorth), validateCategories(db), onCreate(db));

    router.get('/:id?', onRead(config, db));

    router.put('/:id', validate(schemaNetWorth), validateCategories(db), onUpdate(db));

    router.delete('/:id', onDelete(db));

    return router;
}

module.exports = {
    netWorthRoute,
};
