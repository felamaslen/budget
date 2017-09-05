const common = require('../../common');

function getQueryLimitCondition(now, numMonths, offset = 0) {
    // limits a list data query to retrieve items from the last {numMonths} months
    // increasing the offset will paginate the results
    // e.g. if numMonths is 3 and offset is 1, results from the three months starting
    // six months ago will be retrieved
    // note that items from the future are *not* filtered
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthDiffStart = 1 - (offset + 1) * numMonths;

    const startMonth = common.monthAdd(currentMonth, monthDiffStart);
    const startYear = common.yearAddMonth(currentYear, currentMonth, monthDiffStart);

    const limits = [
        `(year > ${startYear} OR (year = ${startYear} AND month >= ${startMonth}))`
    ];

    if (offset > 0) {
        const monthDiffStartEnd = numMonths - 1;

        const endMonth = common.monthAdd(startMonth, monthDiffStartEnd);
        const endYear = common.yearAddMonth(startYear, startMonth, monthDiffStartEnd);

        limits.push(
            `(year < ${endYear} OR (year = ${endYear} AND month <= ${endMonth}))`
        );
    }

    return `(${limits.join(' AND ')})`;
}

function getQuery() {
    return null;
}

module.exports = {
    getQueryLimitCondition,
    getQuery
};

