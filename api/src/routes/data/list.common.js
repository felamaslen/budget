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

module.exports = {
    getLimitCondition,
    getQueryLimitCondition,
    getOlderExistsQuery,
    getQuery
};

