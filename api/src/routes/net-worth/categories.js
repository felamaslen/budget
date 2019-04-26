const { Router } = require('express');

const { clientError, catchAsyncErrors } = require('../../modules/error-handling');
const { validate } = require('../../modules/validate');
const { schemaCategory } = require('../../schema/net-worth');

const create = db => catchAsyncErrors(async (req, res) => {
    const data = req.validBody;

    const [id] = await db.insert(data)
        .returning('id')
        .into('net_worth_categories');

    res.json({
        id,
        ...data
    });
});

const read = db => catchAsyncErrors(async (req, res) => {
    if (req.params.id) {
        const [result] = await db.select()
            .from('net_worth_categories')
            .where({ id: req.params.id });

        if (!result) {
            throw clientError('Category not found', 404);
        }

        return res.json(result);
    }

    const data = await db.select()
        .from('net_worth_categories');

    return res.json(data);
});

function routeCategories(config, db) {
    const router = new Router();

    router.post('/', validate(schemaCategory), create(db));

    router.get('/:id?', read(db));

    return router;
}

module.exports = {
    routeCategories
};
