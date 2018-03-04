const moment = require('moment');
const joi = require('joi');
const { listItemSchema } = require('../../schema/list');
const common = require('../../common');

function getLimitCondition(now, limit) {
    const { numMonths, offset } = limit;

    const monthDiffStart = 1 - (offset + 1) * numMonths;

    const startDate = now.add(monthDiffStart, 'months')
        .startOf('month');

    if (!offset) {
        return { startDate, endDate: null };
    }

    const endDate = startDate.add(numMonths - 1, 'months')
        .endOf('month');

    return { startDate, endDate };
}

async function getOlderExists(db, user, table, limitCondition) {
    const { startDate } = limitCondition;

    const [{ count }] = await db.select(db.raw('COUNT(*) AS count'))
        .from(table)
        .where('date', '<', startDate.format('YYYY-MM-DD'))
        .andWhere('uid', '=', user.uid);

    return count > 0;
}

function getQuery(db, user, table, columns, limitCondition = null) {
    let query = db.select(...columns)
        .from(table)
        .where('uid', '=', user.uid);

    if (limitCondition) {
        const { startDate, endDate } = limitCondition;

        query = query.andWhere('date', '>=', startDate.format('YYYY-MM-DD'));

        if (endDate) {
            query = query.andWhere('date', '<=', endDate.format('YYYY-MM-DD'));
        }
    }

    return query.orderBy('date', 'desc')
        .orderBy('id', 'desc');
}

function formatResults(queryResult, columnMap, addData = null) {
    return queryResult
        .map(row => {
            const processedRow = Object.keys(row)
                .reduce((item, key) => {
                    const value = row[key];

                    const column = columnMap[key];

                    if (key === 'date') {
                        return { ...item, 'd': moment(value).format('YYYY-MM-DD') };
                    }

                    return { ...item, [column]: value };

                }, {});

            if (addData) {
                return addData(processedRow);
            }

            return processedRow;
        });
}

async function getTotalCost(db, user, table) {
    const [{ total }] = await db.select(db.raw('SUM(cost) AS total'))
        .from(table)
        .where('uid', '=', user.uid);

    return Number(total);
}

async function getResults(config, db, user, now, table, addData = null, limit = null) {
    const columnMapExtra = config.data.columnMapExtra[table];

    const columnMap = {
        ...columnMapExtra,
        id: 'I',
        date: 'd',
        item: 'i',
        cost: 'c'
    };
    const columns = Object.keys(columnMap);

    let olderExists = null;
    let limitCondition = null;

    if (limit) {
        limitCondition = getLimitCondition(now, limit);

        olderExists = await getOlderExists(db, user, table, limitCondition);
    }

    const queryResult = await getQuery(db, user, table, columns, limitCondition);

    const data = formatResults(queryResult, columnMap, addData);

    const total = await getTotalCost(db, user, table);

    if (limit) {
        return { data, total, olderExists };
    }

    return { data, total };
}

function getPageLimit(config, table, offset = 0) {
    if (table in config.data.listPageLimits) {
        const numMonths = config.data.listPageLimits[table];

        return { numMonths, offset };
    }

    return null;
}

function routeGet(config, db, table) {
    return async (req, res) => {
        const offset = Math.floor(Number(req.params.page) || 0);
        const limit = getPageLimit(config, table, offset);

        const data = await getResults(config, db, req.user, moment(), table, null, limit);

        return res.json({ data });
    };
}

function processRow(row, table) {
    if (table === 'funds' && 'transactions' in row) {
        const transactions = row.transactions.map(({ date, ...item }) => ({
            ...item,
            date: moment(date).format('YYYY-MM-DD')
        }));

        return { ...row, transactions: JSON.stringify(transactions) };
    }

    return row;
}

async function insertItem(db, user, table, data) {
    const [id] = await db.insert(processRow({ uid: user.uid, ...data }, table))
        .returning('id')
        .into(table);

    return { id };
}

async function updateItem(db, user, table, data) {
    const affectedRows = await db(table)
        .where({ id: data.id, uid: user.uid })
        .update(processRow(data, table));

    if (!affectedRows) {
        throw new common.ErrorBadRequest('Unknown id', 404);
    }

    return null;
}

async function deleteItem(db, user, table, data) {
    const affectedRows = await db(table)
        .where({ id: data.id, uid: user.uid })
        .del();

    if (!affectedRows) {
        throw new common.ErrorBadRequest('Unknown id', 404);
    }
}

function routeModify(config, db, table, schema, operation, successCode = 200) {
    return async (req, res) => {
        const user = req.user;

        const { error, value } = joi.validate(req.body, schema);

        if (error) {
            return res.status(400)
                .json({ errorMessage: error.message });
        }

        try {
            const result = await operation(db, user, table, value);

            const totalCost = await getTotalCost(db, user, table);

            return res.status(successCode)
                .json({
                    ...result,
                    total: totalCost
                });
        }
        catch (err) {
            if (err instanceof common.ErrorBadRequest) {
                return res.status(err.statusCode)
                    .json({ errorMessage: err.message });
            }

            return res.status(500)
                .json({ errorMessage: err.message });
        }
    };
}

function routePost(config, db, table) {
    return routeModify(config, db, table, listItemSchema.insert[table], insertItem, 201);
}

function routePut(config, db, table) {
    return routeModify(config, db, table, listItemSchema.update[table], updateItem);
}

function routeDelete(config, db, table) {
    return routeModify(config, db, table, listItemSchema.delete, deleteItem);
}

module.exports = {
    getLimitCondition,
    getOlderExists,
    getQuery,
    formatResults,
    getTotalCost,
    getResults,
    getPageLimit,
    routeGet,
    routePost,
    routePut,
    routeDelete
};

