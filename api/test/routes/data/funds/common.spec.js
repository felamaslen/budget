const test = require('ava');
const { prepareMockDb } = require('~api/test/test.common');
const md5 = require('md5');
const { DateTime } = require('luxon');

const {
    getMaxAge,
    getNumResultsQuery,
    getAllHistoryForFundsQuery,
    processFundHistory,
    fundHash
} = require('~api/src/routes/data/funds/common');

test('getMaxAge returns the correct timestamp', t => {
    const now = DateTime.fromISO('2017-09-05');

    const formatDate = date => date.toSQL({ includeOffset: false });

    t.is(
        formatDate(getMaxAge(now, 'year', 1)),
        formatDate(DateTime.fromISO('2016-09-05'))
    );

    t.is(
        formatDate(getMaxAge(now, 'year', 3)),
        formatDate(DateTime.fromISO('2014-09-05'))
    );

    t.is(
        formatDate(getMaxAge(now, 'month', 6)),
        formatDate(DateTime.fromISO('2017-03-05'))
    );
});

test('getMaxAge handles invalid parameters', t => {
    const now = DateTime.fromISO('2017-09-05');

    t.is(getMaxAge(now, 'year', 0), 0);
    t.is(getMaxAge(now, 'foo'), 0);
});

test('getNumResultsQuery returns the correct query', async t => {
    const user = { uid: 1 };

    const db = await prepareMockDb();

    t.is(typeof getNumResultsQuery(db, user, 'somesalt', 10), 'object');
});

test('getAllHistoryForFundsQuery returns the correct query', async t => {
    const user = { uid: 1 };

    const db = await prepareMockDb();

    t.is(typeof getAllHistoryForFundsQuery(db, user, 'somesalt', 100, 50, 10), 'object');
});

test('processFundHistory returns the expected data', t => {
    const queryResult = [
        {
            id: '3,22,23,24', time: new Date('2017-04-03 14:23:49'), price: '96.5,100.2,16.29,1.23'
        },
        {
            id: '3,22,23,25', time: new Date('2017-04-21 09:00:01'), price: '97.3,100.03,16.35,67.08'
        },
        {
            id: '7,3,22,23,25', time: new Date('2017-05-01 10:32:43'), price: '10.21,97.4,100.1,16.33,67.22'
        },
        {
            id: '22,25', time: new Date('2017-05-03 10:31:06'), price: '100.15,66.98'
        }
    ];

    const expectedResult = {
        idMap: {
            '3': [96.5, 97.3, 97.4],
            '22': [100.2, 100.03, 100.1, 100.15],
            '23': [16.29, 16.35, 16.33],
            '24': [1.23],
            '25': [67.08, 67.22, 66.98],
            '7': [10.21]
        },
        startIndex: {
            '3': 0,
            '22': 0,
            '23': 0,
            '24': 0,
            '25': 1,
            '7': 2
        },
        startTime: Math.round(DateTime.fromISO('2017-04-03T14:23:49').ts / 1000),
        times: [0, 1535772, 2405334, 2578037]
    };

    t.deepEqual(processFundHistory(queryResult), expectedResult);
});

test('fundHash returns a valid hashed value', t => {
    t.is(fundHash('foobar', 'somesalt'), md5('foobarsomesalt'));
});

