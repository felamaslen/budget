const test = require('ava');
const db = require('~api/src/modules/db')();
const { DateTime } = require('luxon');

const {
    getLimitCondition,
    getOlderExists,
    formatResults,
    getTotalCost
} = require('~api/src/routes/data/list.common');

test('getLimitCondition returns a valid limit condition', t => {
    const now = DateTime.fromISO('2017-09-04');
    const numMonths = 3;

    const result = getLimitCondition(now, { numMonths });

    t.deepEqual(Object.keys(result).reduce((items, key) => ({
        ...items,
        [key]: result[key]
            ? result[key].toISODate()
            : null
    }), {}), {
        startDate: '2017-07-01',
        endDate: null
    });
});

test('getLimitCondition handles pagination', t => {
    const now = DateTime.fromISO('2017-09-03');
    const numMonths = 5;
    const offset = 1;

    const result = getLimitCondition(now, { numMonths, offset });

    t.deepEqual(Object.keys(result).reduce((items, key) => ({
        ...items,
        [key]: result[key]
            ? result[key].toISODate()
            : null
    }), {}), {
        startDate: '2016-12-01',
        endDate: '2017-04-30'
    });
});

test('getOlderExists returns the correct result', async t => {
    const [{ uid }] = await db.select('uid')
        .from('users')
        .where('name', '=', 'test-user');

    const user = { uid };
    const table = 'food';

    t.true(await getOlderExists(db, user, table, { startDate: DateTime.fromISO('2018-10-03') }));
    t.false(await getOlderExists(db, user, table, { startDate: DateTime.fromISO('2017-04-23') }));
});

test('formatResults works as expected', t => {
    const queryResult = [
        { date: new Date('2017-09-12'), item: 'foo', category: 'bar' },
        { date: new Date('2017-08-29'), item: 'baz', category: 'bak' }
    ];

    const columnMap = {
        item: 'i',
        category: 'k'
    };

    t.deepEqual(queryResult.map(formatResults(columnMap)), [
        {
            'd': '2017-09-12', 'i': 'foo', 'k': 'bar'
        },
        {
            'd': '2017-08-29', 'i': 'baz', 'k': 'bak'
        }
    ]);
});

test('getTotalCost returns the correct query', async t => {
    const [{ uid }] = await db.select('uid')
        .from('users')
        .where('name', '=', 'test-user');

    const user = { uid };

    t.is(await getTotalCost(db, user, 'food'), 19239 + 91923 + 2239);
});
