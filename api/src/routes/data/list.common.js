const common = require('../../common');

function getLimitCondition(now, numMonths, offset = 0) {
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthDiffStart = 1 - (offset + 1) * numMonths;

    const startMonth = common.monthAdd(currentMonth, monthDiffStart);
    const startYear = common.yearAddMonth(currentYear, currentMonth, monthDiffStart);

    const monthDiffStartEnd = numMonths - 1;

    const endMonth = common.monthAdd(startMonth, monthDiffStartEnd);
    const endYear = common.yearAddMonth(startYear, startMonth, monthDiffStartEnd);

    return { startYear, startMonth, endYear, endMonth };
}

function getQueryLimitCondition(startYear, startMonth, endYear, endMonth, past = false) {
    // limits a list data query to retrieve items from the last {numMonths} months
    // increasing the offset will paginate the results
    // e.g. if numMonths is 3 and offset is 1, results from the three months starting
    // six months ago will be retrieved
    const limits = [
        `(year > ${startYear} OR (year = ${startYear} AND month >= ${startMonth}))`
    ];

    if (past) {
        limits.push(
            `(year < ${endYear} OR (year = ${endYear} AND month <= ${endMonth}))`
        );
    }

    return `(${limits.join(' AND ')})`;
}

function getOlderExistsQuery(db, user, table, startYear, startMonth) {
    return db.select('COUNT(*) AS count')
        .from(table)
        .where('date', '<', new Date(startYear, startMonth + 1, 1))
        .andWhere('uid', '=', user.uid);
}

function getQuery(db, user, table, columns, limitCondition = null) {
    const conditions = limitCondition
        ? [limitCondition]
        : [];

    return db.select(...columns)
        .from(table)
        .whereRaw(conditions.join(' AND '))
        .andWhere('uid', '=', user.uid)
        .orderBy('date', 'desc')
        .orderBy('id', 'desc');
}

function formatResults(queryResult, columnMap, addData = null) {
    const dateKeys = ['year', 'month', 'date'];

    return queryResult
        .map(row => {
            const processedRow = Object.keys(row)
                .reduce((obj, key) => {
                    const value = row[key];

                    const dateKey = dateKeys.indexOf(key);
                    if (dateKey === -1) {
                        const column = columnMap[key];

                        obj[column] = value;
                    }
                    else {
                        obj.d[dateKey] = value;
                    }

                    return obj;
                }, { 'd': [] });

            if (addData) {
                return addData(processedRow);
            }

            return processedRow;
        });
}

function getTotalCostQuery(db, user, table) {
    return db.select('SUM(cost) AS total')
        .from(table)
        .where('uid', '=', user.uid);
}

async function getTotalCost(db, user, table) {
    const result = await getTotalCostQuery(db, user, table);

    return result[0].total;
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
    const columns = ['year', 'month', 'date']
        .concat(Object.keys(columnMap));

    let olderExists = null;
    let limitCondition = null;

    if (limit) {
        const { startYear, startMonth, endYear, endMonth } = getLimitCondition(
            now, limit.numMonths, limit.offset
        );

        limitCondition = getQueryLimitCondition(
            startYear, startMonth, endYear, endMonth, limit.offset > 0
        );

        const olderExistsQuery = await getOlderExistsQuery(
            db, user, table, startYear, startMonth
        );

        olderExists = olderExistsQuery[0].count > 0;
    }

    const queryResult = await getQuery(db, user, table, columns, limitCondition);

    const data = formatResults(queryResult, columnMap, addData);

    const total = await getTotalCost(db, user, table);

    const result = {
        data,
        total
    };

    if (olderExists !== null) {
        result.olderExists = olderExists;
    }

    return result;
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

        const data = await getResults(config, db, req.user, new Date(), table, null, limit);

        return res.json({ data });
    };
}

function getUndefinedItem(items, data) {
    return items.reduce((status, item) => {
        if (status || item in data) {
            return status;
        }

        return item;
    }, null);
}

function validateDate(data, allRequired = true) {
    const undefinedItem = getUndefinedItem(['year', 'month', 'date'], data);

    if (undefinedItem) {
        if (allRequired) {
            throw new common.ErrorBadRequest(`didn't provide ${undefinedItem}`);
        }

        return {};
    }

    ['year', 'month', 'date'].forEach(dateItem => {
        const item = parseInt(data[dateItem], 10);

        if (isNaN(item)) {
            throw new common.ErrorBadRequest(`invalid ${dateItem}`);
        }
    });

    const year = parseInt(data.year, 10);
    const month = parseInt(data.month, 10);
    const date = parseInt(data.date, 10);

    if (month < 1 || month > 12) {
        throw new common.ErrorBadRequest('month out of range');
    }

    if (date < 1 || date > common.monthLength(year, month)) {
        throw new common.ErrorBadRequest('date out of range');
    }

    return { year, month, date };
}

function validateInsertData(data, allRequired = true, extraStringColumns = []) {
    const validData = {};

    const undefinedItem = getUndefinedItem(['date', 'item', 'cost'].concat(
        extraStringColumns.map(column => column.name)
    ), data);

    if (undefinedItem && allRequired) {
        throw new common.ErrorBadRequest(`didn't provide ${undefinedItem}`);
    }

    if ('date' in data) {
        if (typeof data.date !== 'object') {
            throw new common.ErrorBadRequest('invalid date object');
        }

        const { year, month, date } = validateDate(data.date, allRequired);
        if (year && month && date) {
            validData.year = year;
            validData.month = month;
            validData.date = date;
        }
    }

    if ('item' in data) {
        const itemValue = data.item.toString();

        if (!itemValue.length) {
            throw new common.ErrorBadRequest('item must not be empty');
        }

        validData.item = itemValue;
    }

    if ('cost' in data) {
        const cost = parseInt(data.cost, 10);
        if (isNaN(cost)) {
            throw new common.ErrorBadRequest('invalid cost data');
        }

        validData.cost = cost;
    }

    extraStringColumns.forEach(column => {
        if (column.name in data) {
            const value = data[column.name].toString();

            if (column.notEmpty && !value.length) {
                throw new common.ErrorBadRequest(`${column.name} must not be empty`);
            }

            validData[column.name] = value;
        }
    });

    return validData;
}

function validateUpdateData(data, extraStringColumns = []) {
    if (!('id' in data)) {
        throw new common.ErrorBadRequest('didn\'t provide id');
    }

    const id = parseInt(data.id, 10);
    if (isNaN(id) || id < 1) {
        throw new common.ErrorBadRequest('invalid id');
    }

    const dataWithoutId = Object.keys(data).reduce((obj, key) => {
        if (key !== 'id') {
            obj[key] = data[key];
        }

        return obj;
    }, {});

    if (!Object.keys(dataWithoutId).length) {
        throw new common.ErrorBadRequest('no data provided');
    }

    const values = validateInsertData(dataWithoutId, false, extraStringColumns);

    return { id, values };
}

function validateDeleteData(data) {
    if (!('id' in data)) {
        throw new common.ErrorBadRequest('didn\'t provide id');
    }

    const id = parseInt(data.id, 10);
    if (isNaN(id) || id < 1) {
        throw new common.ErrorBadRequest('invalid id');
    }

    return id;
}

async function insertItem(db, user, table, validData) {
    const [id] = await db.insert({ uid: user.uid, ...validData })
        .into(table);

    return { id };
}

async function updateItem(db, user, table, validData) {
    const affectedRows = await db(table).where({ id: validData.id, uid: user.uid })
        .update(validData);

    if (!affectedRows) {
        throw new common.ErrorBadRequest('unknown id', 404);
    }

    return null;
}

async function deleteItem(db, user, table, id) {
    const affectedRows = await db(table).where({ id, uid: user.uid })
        .del();

    if (!affectedRows) {
        throw new common.ErrorBadRequest('unknown id', 404);
    }
}

function routeModify(config, db, table, validate, operation, successCode = 200) {
    return async (req, res) => {
        const user = req.user;

        const rawData = req.body;
        let validData = null;

        let statusCode = successCode;
        let response = { error: false };

        try {
            validData = validate(rawData);

            const operationResult = await operation(db, user, table, validData);

            if (operationResult) {
                response = { ...response, ...operationResult };
            }

            response.total = await getTotalCost(db, user, table);
        }
        catch (err) {
            if (err instanceof common.ErrorBadRequest) {
                statusCode = err.statusCode;
            }
            else {
                statusCode = 500;
            }

            response.error = true;
            response.errorMessage = err.message;
        }

        return res
            .status(statusCode)
            .json(response);
    };
}

function routePost(config, db, table, validate = validateInsertData) {
    return routeModify(config, db, table, validate, insertItem, 201);
}

function routePut(config, db, table, validate = validateUpdateData) {
    return routeModify(config, db, table, validate, updateItem);
}

function routeDelete(config, db, table) {
    return routeModify(config, db, table, validateDeleteData, deleteItem);
}

module.exports = {
    getLimitCondition,
    getQueryLimitCondition,
    getOlderExistsQuery,
    getQuery,
    formatResults,
    getTotalCostQuery,
    getTotalCost,
    getResults,
    getPageLimit,
    routeGet,
    validateDate,
    validateInsertData,
    validateUpdateData,
    validateDeleteData,
    routePost,
    routePut,
    routeDelete
};

