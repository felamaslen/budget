const common = require('../../../common');
const config = require('../../../config')();

function getCategoryColumn(category, groupBy) {
    // get database column corresponding to "category" type
    if (category === 'bills') {
        return 'item';
    }

    if (groupBy === 'category') {
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

    if (groupBy === 'shop') {
        return 'shop';
    }

    return null;
}

function periodDescriptionWeekly(year, month, date) {
    return `Week beginning ${config.months[month - 1]} ${date}, ${year}`;
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

    const condition = common.strip(`(
        year > ${yearStart} OR (year = ${yearStart} AND (
            month > ${monthStart} OR (month = ${monthStart} AND date >= ${dateStart})
        ))
    ) AND (
        year < ${yearEnd} OR (year = ${yearEnd} AND (
            month < ${monthEnd} OR (month = ${monthEnd} AND date <= ${dateEnd})
        ))
    )`);

    const description = periodDescriptionWeekly(yearStart, monthStart, dateStart);

    return { condition, description };
}

function periodDescriptionMonthly(year, month) {
    return `${config.months[month - 1]} ${year}`;
}

function periodConditionMonthly(year, month, pageIndex = 0) {
    const conditionYear = common.yearAddMonth(year, month, -pageIndex);
    const conditionMonth = common.monthAdd(month, -pageIndex);

    const condition = `year = ${conditionYear} AND month = ${conditionMonth}`;

    const description = periodDescriptionMonthly(conditionYear, conditionMonth);

    return { condition, description };
}

function periodDescriptionYearly(year) {
    return year.toString();
}

function periodConditionYearly(year, pageIndex = 0) {
    const conditionYear = year - pageIndex;

    const condition = `year = ${conditionYear}`;

    const description = periodDescriptionYearly(conditionYear);

    return { condition, description };
}

function periodCondition(now, period, pageIndex = 0) {
    if (period === 'week') {
        return periodConditionWeekly(common.getBeginningOfWeek(now), pageIndex);
    }

    const year = now.getFullYear();

    if (period === 'month') {
        const month = now.getMonth() + 1;

        return periodConditionMonthly(year, month, pageIndex);
    }

    if (period === 'year') {
        return periodConditionYearly(year, pageIndex);
    }

    return null;
}

function validateParams(period, groupBy, pageIndex, category = null) {
    const allowedPeriods = ['week', 'month', 'year'];

    if (allowedPeriods.indexOf(period) === -1) {
        return { isValid: false, param: 'period' };
    }

    const allowedGroupby = ['shop', 'category'];

    if (allowedGroupby.indexOf(groupBy) === -1) {
        return { isValid: false, param: 'groupBy' };
    }

    if (isNaN(pageIndex) || pageIndex < 0) {
        return { isValid: false, param: 'pageIndex' };
    }

    const allowedCategories = ['food', 'general', 'social', 'holiday'];
    if (category && allowedCategories.indexOf(category) === -1) {
        return { isValid: false, param: 'category' };
    }

    return { isValid: true };
}

async function handlerInvalidParams(req, res, validationStatus) {
    await req.db.end();

    return res
        .status(400)
        .json({
            error: true,
            errorMessage: `Invalid parameter value for ${validationStatus.param}`
        });
}

async function handlerValidResult(req, res, result) {
    await req.db.end();

    return res.json({
        error: false,
        data: result
    });
}

module.exports = {
    getCategoryColumn,
    periodConditionWeekly,
    periodConditionMonthly,
    periodConditionYearly,
    periodCondition,
    validateParams,
    handlerInvalidParams,
    handlerValidResult
};

