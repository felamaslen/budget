import test from 'ava';
import { DateTime } from 'luxon';
import db from '~api/modules/db';
import {
    getPeriodCostForCategory,
    getRowsByDate,
    processTimelineData,
    getPeriodCost,
} from '~api/routes/data/analysis';

test('getPeriodCostForCategory getting valid data', async (t) => {
    const [{ uid }] = await db.select('uid')
        .from('users')
        .where('name', '=', 'test-user');

    const user = { uid };

    const result = await getPeriodCostForCategory(
        db,
        user,
        DateTime.fromObject({ year: 2018, month: 1, day: 3 }),
        DateTime.fromObject({ year: 2018, month: 10, day: 4 }),
        'food',
        'category',
    );

    t.deepEqual(result, [
        { itemCol: 'Food', cost: 111162 },
        { itemCol: 'Snacks', cost: 2239 },
    ]);
});

test('getRowsByDate working as expected', (t) => {
    const input = [
        [
            { date: new Date('2015-01-10'), cost: 5 },
            { date: new Date('2016-12-06'), cost: 10 },
            { date: new Date('2016-12-20'), cost: 11 },
            { date: new Date('2017-01-04'), cost: 15 },
            { date: new Date('2017-09-03'), cost: 3 },
        ],
        [
            { date: new Date('2015-01-10'), cost: 1 },
            { date: new Date('2015-03-04'), cost: 50 },
            { date: new Date('2017-05-30'), cost: 17 },
        ],
        [
            { date: new Date('2016-04-04'), cost: 3 },
        ],
    ];

    const expectedResult = {
        2015: {
            0: {
                10: [5, 1],
            },
            2: {
                4: [0, 50],
            },
        },
        2016: {
            3: {
                4: [0, 0, 3],
            },
            11: {
                6: [10],
                20: [11],
            },
        },
        2017: {
            0: {
                4: [15],
            },
            4: {
                30: [0, 17],
            },
            8: {
                3: [3],
            },
        },
    };

    t.deepEqual(getRowsByDate(input), expectedResult);
});

test('processTimelineData (for yearly data) returning an item for each day in the year', (t) => {
    const data = [
        [
            { date: new Date('2015-01-10'), cost: 5 },
            { date: new Date('2016-12-06'), cost: 10 },
            { date: new Date('2016-12-20'), cost: 11 },
            { date: new Date('2017-01-04'), cost: 15 },
            { date: new Date('2017-09-03'), cost: 3 },
        ],
        [
            { date: new Date('2015-01-10'), cost: 1 },
            { date: new Date('2015-03-04'), cost: 50 },
            { date: new Date('2017-05-30'), cost: 17 },
        ],
        [
            { date: new Date('2016-04-04'), cost: 3 },
        ],
    ];

    const params = { period: 'year' };

    const condition = { startTime: DateTime.fromISO('2016-01-01') };

    const expectedResult = [
        ...new Array(31 + 29 + 31 + 3).fill([]),
        [0, 0, 3],
        ...new Array(26 + 31 + 30 + 31 + 31 + 30 + 31 + 30 + 5).fill([]),
        [10],
        ...new Array(13).fill([]),
        [11],
        ...new Array(11).fill([]),
    ];

    t.deepEqual(processTimelineData(data, params, condition), expectedResult);
});

test('processTimelineData (for monthly data) returning an item for each day in the month', (t) => {
    const data = [
        [
            { date: new Date('2015-01-10'), cost: 5 },
            { date: new Date('2016-12-06'), cost: 10 },
            { date: new Date('2016-12-20'), cost: 11 },
            { date: new Date('2017-01-04'), cost: 15 },
            { date: new Date('2017-09-03'), cost: 3 },
        ],
        [
            { date: new Date('2015-01-10'), cost: 1 },
            { date: new Date('2015-03-04'), cost: 50 },
            { date: new Date('2017-05-30'), cost: 17 },
        ],
        [
            { date: new Date('2016-04-04'), cost: 3 },
        ],
    ];

    const params = { period: 'month' };

    const condition = { startTime: DateTime.fromISO('2016-12-01') };

    const expectedResult = [
        ...new Array(5).fill([]),
        [10],
        ...new Array(13).fill([]),
        [11],
        ...new Array(11).fill([]),
    ];

    t.deepEqual(processTimelineData(data, params, condition), expectedResult);
});

test('processTimelineData (without a valid period) return null', (t) => {
    t.is(processTimelineData([], 'notmonthoryear', {}), null);
});

test('getPeriodCost getting cost data and a period description', async (t) => {
    const [{ uid }] = await db.select('uid')
        .from('users')
        .where('name', '=', 'test-user');

    const user = { uid };
    const now = DateTime.fromISO('2018-03-04');
    const params = { period: 'month', groupBy: 'category', pageIndex: 0 };

    const result = await getPeriodCost(db, user, now, params);

    const expectedResult = {
        timeline: new Array(24).fill([])
            .concat([[76402, 113401, 11143, 35014, 61923]])
            .concat(new Array(6).fill([])),
        cost: [
            ['bills', [['Electricity', 3902], ['Rent', 72500]]],
            ['food', [['Food', 111162], ['Snacks', 2239]]],
            ['general', [['Foo', 11143]]],
            ['holiday', [['a country', 35014]]],
            ['social', [['Bar', 61923]]],
        ],
        saved: 135318,
        description: 'March 2018',
    };

    t.deepEqual(result, expectedResult);
});
