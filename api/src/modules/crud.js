const { Router } = require('express');

const { clientError, catchAsyncErrors } = require('./error-handling');
const { validate } = require('./validate');

const noop = (value) => value;

const makeGetItem = (table, item, dbToJson) => async (db, id) => {
    const [data] = await db.select()
        .from(table)
        .where({ id });

    if (!data) {
        throw clientError(`${item} not found`, 404);
    }

    return dbToJson(data);
};

const checkItem = (db, table, item, getId = (req) => req.params.id) => {
    const getItem = makeGetItem(table, item, noop);

    return catchAsyncErrors(async (req, res, next) => {
        await getItem(db, getId(req));

        next();
    });
};

const onCreate = (db, table, jsonToDb, getItem) => catchAsyncErrors(async (req, res) => {
    const data = jsonToDb(req.validBody, req.params);

    const [id] = await db.insert(data)
        .returning('id')
        .into(table);

    const newItem = await getItem(db, id);

    res.status(201).json(newItem);
});

const onRead = (db, table, getItem, dbToJson) => catchAsyncErrors(async (req, res) => {
    if (req.params.id) {
        const data = await getItem(db, req.params.id);

        return res.json(data);
    }

    const data = await db.select()
        .from(table);

    const items = data.map(dbToJson);

    return res.json(items);
});

const onUpdate = (db, table, getItem, jsonToDb) => catchAsyncErrors(async (req, res) => {
    await getItem(db, req.params.id);

    const data = jsonToDb(req.validBody, req.params);

    await db(table)
        .update(data)
        .where({ id: req.params.id });

    const updated = await getItem(db, req.params.id);

    res.json(updated);
});

const onDelete = (db, table, getItem) => catchAsyncErrors(async (req, res) => {
    await getItem(db, req.params.id);
    await db(table)
        .where({ id: req.params.id })
        .delete();

    res.status(204).end();
});

function makeCrudRoute({
    table,
    item,
    schema,
    jsonToDb = noop,
    dbToJson = noop,
}) {
    const getItem = makeGetItem(table, item, dbToJson);

    return (db, router = new Router(), prefix = '') => {
        router.post(`${prefix}/`, validate(schema), onCreate(db, table, jsonToDb, getItem));

        router.get(`${prefix}/:id?`, onRead(db, table, getItem, dbToJson));

        router.put(`${prefix}/:id`, validate(schema), onUpdate(db, table, getItem, jsonToDb));

        router.delete(`${prefix}/:id`, onDelete(db, table, getItem));

        return router;
    };
}

module.exports = {
    checkItem,
    makeCrudRoute,
};
