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
    return db.query(`
    SELECT COUNT(*) AS count
    FROM ${table}
    WHERE uid = ? AND (
        year < ${startYear} OR (year = ${startYear} AND month < ${startMonth})
    )`, user.uid);
}

function getQuery(db, user, table, columns, limitCondition = null) {
    const conditions = ['uid = ?'];
    if (limitCondition) {
        conditions.push(limitCondition);
    }

    return db.query(`
    SELECT ${columns.join(', ')} FROM ${table}
    WHERE ${conditions.join(' AND ')}
    ORDER BY year DESC, month DESC, date DESC, id DESC
    `, user.uid);
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
    return db.query(`
    SELECT SUM(cost) AS total FROM ${table} WHERE uid = ?
    `, user.uid);
}

async function getTotalCost(db, user, table) {
    const result = await getTotalCostQuery(db, user, table);

    return result[0].total;
}

async function getResults(
    db, user, now, table, columnMapExtra, addData = null, limit = null
) {
    const columnMap = Object.assign({}, columnMapExtra, {
        id: 'I'
    });
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

        olderExists = olderExistsQuery.count > 0;
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

function validateDate(data) {
    ['year', 'month', 'date'].forEach(dateItem => {
        if (!(dateItem in data)) {
            throw new Error(`didn't provide ${dateItem}`);
        }

        const item = parseInt(data[dateItem], 10);

        if (isNaN(item)) {
            throw new Error(`invalid ${dateItem}`);
        }
    });

    const year = parseInt(data.year, 10);
    const month = parseInt(data.month, 10);
    const date = parseInt(data.date, 10);

    if (month < 1 || month > 12) {
        throw new Error('month out of range');
    }

    if (date < 1 || date > common.monthLength(year, month)) {
        throw new Error('date out of range');
    }

    return { year, month, date };
}

function validateInsertData(data) {
    const validData = {};

    // validate dates
    const { year, month, date } = validateDate(data);
    validData.year = year;
    validData.month = month;
    validData.date = date;

    // validate item
    if (!('item' in data) || !data.item.toString().length) {
        throw new Error('didn\'t provide data for `item`');
    }

    validData.item = data.item.toString();

    // validate cost
    if (!('cost' in data)) {
        throw new Error('didn\'t provide data for `cost`');
    }

    const cost = parseInt(data.cost, 10);
    if (isNaN(cost)) {
        throw new Error('invalid cost data');
    }

    validData.cost = cost;

    return validData;
}

async function insertItem(db, user, table, validData) {
    const columns = Object.keys(validData);
    const values = Object.values(validData);

    console.log({ columns, values });

    console.log(columns.join(', '));
    console.log(values.map(() => '?').join(', '));

    try {
        const insertQuery = await db.query(`
        INSERT INTO ${table} (uid, ${columns.join(', ')})
        VALUES (?, ${values.map(() => '?').join(', ')})`, user.uid, ...values);

        const insertedId = insertQuery.insertId;

        return insertedId;
    }
    catch (err) {
        const duplicateMatch = err.message.match(/^ER_DUP_ENTRY: .* for key '([\w\s]+)'$/);
        if (duplicateMatch) {
            throw new Error(duplicateMatch[1]);
        }

        throw err;
    }
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
    validateDate,
    validateInsertData,
    insertItem
};

