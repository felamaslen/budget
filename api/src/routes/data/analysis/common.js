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
    const startTime = now.startOf('week').add(-pageIndex, 'weeks');
    const endTime = startTime.clone().endOf('week');

    const description = `Week beginning ${startTime.format('MMMM Do, YYYY')}`;

    return { startTime, endTime, description };
}

function periodConditionMonthly(now, pageIndex = 0) {
    const startTime = now.startOf('month').add(-pageIndex, 'months');
    const endTime = startTime.clone().endOf('month');

    const description = `${startTime.format('MMMM YYYY')}`;

    return { startTime, endTime, description };
}

function periodConditionYearly(now, pageIndex = 0) {
    const startTime = now.startOf('year').add(-pageIndex, 'years');
    const endTime = startTime.clone().endOf('year');

    const description = startTime.format('YYYY');

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

