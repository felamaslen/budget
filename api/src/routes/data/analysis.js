const common = require('../../common');

function getCategoryColumn(category, grouping) {
    // get database column corresponding to "category" type
    if (category === 'bills') {
        return 'item';
    }

    if (grouping === 'category') {
        if (category === 'food' || category === 'general') {
            return 'category';
        }

        if (category === 'social') {
            return 'society';
        }

        if (category === 'holiday') {
            return 'holiday';
        }

        return 'item';
    }

    if (grouping === 'shop') {
        return 'shop';
    }

    return null;
}

function periodConditionWeekly(beginningOfWeek, pageIndex = 0) {
    const referenceTime = beginningOfWeek.getTime() - 86400 * 1000 * pageIndex * 7;

    const dateTimeStart = new Date(referenceTime);
    const dateTimeEnd = new Date(referenceTime + 86400 * 1000 * 6);

    const yearStart = dateTimeStart.getFullYear();
    const monthStart = dateTimeStart.getMonth() + 1;
    const dateStart = dateTimeStart.getDate();

    const yearEnd = dateTimeEnd.getFullYear();
    const monthEnd = dateTimeEnd.getMonth() + 1;
    const dateEnd = dateTimeEnd.getDate();

    const query = common.strip(`(
        year > ${yearStart} OR (year = ${yearStart} AND (
            month > ${monthStart} OR (month = ${monthStart} AND date >= ${dateStart})
        ))
    ) AND (
        year < ${yearEnd} OR (year = ${yearEnd} AND (
            month < ${monthEnd} OR (month = ${monthEnd} AND date <= ${dateEnd})
        ))
    )`);

    return query;
}

function periodConditionMonthly(year, month, pageIndex = 0) {
    const conditionYear = common.yearAddMonth(year, month, -pageIndex);
    const conditionMonth = common.monthAdd(month, -pageIndex);

    return `year = ${conditionYear} AND month = ${conditionMonth}`;
}

function handler(req, res) {
    return res.end('Analysis data not done yet');
}

module.exports = {
    getCategoryColumn,
    periodConditionWeekly,
    periodConditionMonthly,
    handler
};

