const test = require('ava');
const scraper = require('~api/scripts/scrapeFunds/process');
const { fundHash } = require('~api/src/routes/data/funds/common');
const config = require('~api/src/config')();
const logger = require('~api/src/modules/logger')(true);

const TEST_FUND_NAMES = [
    'HL Multi-Manager UK Growth (accum.)',
    'City of London Investment Trust ORD 25p (share)'
];

test('getBroker returning  HL for valid fund names', t => {
    t.is(scraper.getBroker(config, TEST_FUND_NAMES[0]), 'hl');
    t.is(scraper.getBroker(config, TEST_FUND_NAMES[1]), 'hl');
});

test('getBroker throwing an error for invalid fund names', t => {
    t.throws(() => scraper.getBroker('foo'));
});

test('getEligibleFunds maps and filters funds by validity', t => {
    const queryResultAllInvalid = [
        { uid: 1, item: TEST_FUND_NAMES[0], units: null, cost: null },
        { uid: 1, item: TEST_FUND_NAMES[1], units: 5, cost: 3 },
        { uid: 2, item: TEST_FUND_NAMES[1], units: -5, cost: -2 }
    ];

    t.deepEqual(scraper.getEligibleFunds(config, logger, queryResultAllInvalid), []);

    const queryResultSomeInvalid = [
        {
            uid: 1,
            item: TEST_FUND_NAMES[0]
        },
        {
            uid: 1,
            item: TEST_FUND_NAMES[0],
            units: 10,
            cost: 12
        },
        {
            uid: 1,
            item: TEST_FUND_NAMES[0],
            units: 1678.42 + 846.38 + 817 + 1217.43 - 4559.23
        },
        {
            uid: 1,
            item: TEST_FUND_NAMES[0],
            units: -10
        },
        {
            uid: 2,
            item: TEST_FUND_NAMES[1],
            units: 100,
            cost: 99
        },
        {
            uid: 2,
            item: TEST_FUND_NAMES[1],
            units: -46,
            cost: -89
        },
        {
            uid: 2,
            item: TEST_FUND_NAMES[0],
            units: 0,
            cost: 10
        },
        {
            uid: 2,
            item: TEST_FUND_NAMES[0],
            units: 10
        }
    ];

    t.deepEqual(scraper.getEligibleFunds(config, logger, queryResultSomeInvalid), [
        {
            uid: 1,
            hash: fundHash(TEST_FUND_NAMES[0], config.data.funds.salt),
            broker: 'hl',
            name: TEST_FUND_NAMES[0],
            cost: 12,
            units: 10
        },
        {
            uid: 2,
            hash: fundHash(TEST_FUND_NAMES[1], config.data.funds.salt),
            broker: 'hl',
            name: TEST_FUND_NAMES[1],
            cost: 10,
            units: 54
        }
    ]);
});

test('getEligibleFunds filters funds by uniqueness', t => {
    const queryResultSomeDuplicate = [
        {
            uid: 1,
            item: TEST_FUND_NAMES[1],
            cost: 150,
            units: 100
        },
        {
            uid: 1,
            item: TEST_FUND_NAMES[1],
            cost: -64,
            units: -46
        },
        {
            uid: 2,
            item: TEST_FUND_NAMES[0],
            cost: 29,
            units: 20
        },
        {
            uid: 2,
            item: TEST_FUND_NAMES[0],
            cost: 25,
            units: 10
        }
    ];

    t.deepEqual(scraper.getEligibleFunds(config, logger, queryResultSomeDuplicate), [
        {
            uid: 1,
            hash: fundHash(TEST_FUND_NAMES[1], config.data.funds.salt),
            broker: 'hl',
            name: TEST_FUND_NAMES[1],
            cost: 86,
            units: 54
        },
        {
            uid: 2,
            hash: fundHash(TEST_FUND_NAMES[0], config.data.funds.salt),
            broker: 'hl',
            name: TEST_FUND_NAMES[0],
            cost: 54,
            units: 30
        }
    ]);
});
