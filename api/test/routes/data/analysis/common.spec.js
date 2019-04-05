const test = require('ava');
const { DateTime } = require('luxon');

const analysis = require('~api/src/routes/data/analysis/common');

test('getCategoryColumn returning a group as expected', t => {
    t.is(analysis.getCategoryColumn('bills'), 'item');
    t.is(analysis.getCategoryColumn('food', 'category'), 'category');
    t.is(analysis.getCategoryColumn('general', 'category'), 'category');
    t.is(analysis.getCategoryColumn('social', 'category'), 'society');
    t.is(analysis.getCategoryColumn('holiday', 'category'), 'holiday');
    t.is(analysis.getCategoryColumn(null, 'category'), 'item');
    t.is(analysis.getCategoryColumn(null, 'shop'), 'shop');

    t.is(analysis.getCategoryColumn(null, null), null);
});

test('periodCondition getting weekly periods', t => {
    const now = DateTime.fromISO('2017-09-04');

    const result = analysis.periodCondition(now, 'week');

    t.is(result.startTime.toISODate(), '2017-09-04');
    t.is(result.endTime.toISODate(), '2017-09-10');
    t.is(result.description, 'Week beginning September 4, 2017');

    const result3 = analysis.periodCondition(now, 'week', 3);

    t.is(result3.startTime.toISODate(), '2017-08-14');
    t.is(result3.endTime.toISODate(), '2017-08-20');
    t.is(result3.description, 'Week beginning August 14, 2017');
});

test('periodCondition getting monthly periods', t => {
    const now = DateTime.fromISO('2017-09-04');

    const result = analysis.periodCondition(now, 'month');

    t.is(result.startTime.toISODate(), '2017-09-01');
    t.is(result.endTime.toISODate(), '2017-09-30');
    t.is(result.description, 'September 2017');

    const result10 = analysis.periodCondition(now, 'month', 10);

    t.is(result10.startTime.toISODate(), '2016-11-01');
    t.is(result10.endTime.toISODate(), '2016-11-30');
    t.is(result10.description, 'November 2016');
});

test('periodCondition getting yearly periods', t => {
    const now = DateTime.fromISO('2017-09-04');

    const result = analysis.periodCondition(now, 'year');

    t.is(result.startTime.toISODate(), '2017-01-01');
    t.is(result.endTime.toISODate(), '2017-12-31');
    t.is(result.description, '2017');

    const result10 = analysis.periodCondition(now, 'year', 5);

    t.is(result10.startTime.toISODate(), '2012-01-01');
    t.is(result10.endTime.toISODate(), '2012-12-31');
    t.is(result10.description, '2012');
});

