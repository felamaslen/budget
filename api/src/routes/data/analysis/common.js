const { DateTime } = require('luxon');

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

function periodConditionWeekly(now, pageIndex = 0) {
    const startTime = now.startOf('week').plus({ weeks: -pageIndex });
    const endTime = startTime.endOf('week');

    const description = `Week beginning ${startTime.setLocale('en').toLocaleString(DateTime.DATE_FULL)}`;

    return { startTime, endTime, description };
}

function periodConditionMonthly(now, pageIndex = 0) {
    const startTime = now.startOf('month').plus({ months: -pageIndex });
    const endTime = startTime.endOf('month');

    const description = startTime.toFormat('MMMM yyyy');

    return { startTime, endTime, description };
}

function periodConditionYearly(now, pageIndex = 0) {
    const startTime = now.startOf('year').plus({ years: -pageIndex });
    const endTime = startTime.endOf('year');

    const description = startTime.toFormat('yyyy');

    return { startTime, endTime, description };
}

function periodCondition(now, period, pageIndex = 0) {
    if (period === 'week') {
        return periodConditionWeekly(now, pageIndex);
    }

    if (period === 'month') {
        return periodConditionMonthly(now, pageIndex);
    }

    if (period === 'year') {
        return periodConditionYearly(now, pageIndex);
    }

    throw new Error('Invalid period parameter');
}

module.exports = {
    getCategoryColumn,
    periodCondition
};
