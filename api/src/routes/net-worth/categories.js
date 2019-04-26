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

const getItem = (db, id) => db.select()
    .from('net_worth_categories')
    .where({ id });

const read = db => catchAsyncErrors(async (req, res) => {
    if (req.params.id) {
        const [result] = await getItem(db, req.params.id);

        if (!result) {
            throw clientError('Category not found', 404);
        }

        return res.json(result);
    }

    const data = await db.select()
        .from('net_worth_categories');

    return res.json(data);
});

const checkExists = async (db, id) => {
    const [current] = await db.select('id')
        .from('net_worth_categories')
        .where({ id });

    if (!current) {
        throw clientError('Category not found', 404);
    }

    return current;
};

const update = db => catchAsyncErrors(async (req, res) => {
    await checkExists(db, req.params.id);

    const data = req.validBody;

    await db('net_worth_categories')
        .update(data)
        .where({ id: req.params.id });

    const [updated] = await getItem(db, req.params.id);

    res.json(updated);
});

const deleteItem = db => catchAsyncErrors(async (req, res) => {
    await checkExists(db, req.params.id);
    await db('net_worth_categories')
        .where({ id: req.params.id })
        .delete();

    res.status(204).end();
});

function routeCategories(config, db) {
    const router = new Router();

    router.post('/', validate(schemaCategory), create(db));

    router.get('/:id?', read(db));

    router.put('/:id', validate(schemaCategory), update(db));

    router.delete('/:id', deleteItem(db));

    return router;
}

module.exports = {
    routeCategories
};
