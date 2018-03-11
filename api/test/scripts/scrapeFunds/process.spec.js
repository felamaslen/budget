const { expect } = require('chai');
const scraper = require('../../../scripts/scrapeFunds/process');
const { fundHash } = require('../../../src/routes/data/funds/common');
const config = require('../../../src/config')();
const logger = require('../../../src/modules/logger')(true);

const TEST_FUND_NAMES = [
    'HL Multi-Manager UK Growth (accum.)',
    'City of London Investment Trust ORD 25p (share)'
];

describe('scrapeFunds process', () => {
    describe('getBroker', () => {
        it('should return HL for valid fund names', () => {
            expect(scraper.getBroker(config, TEST_FUND_NAMES[0])).to.equal('hl');
            expect(scraper.getBroker(config, TEST_FUND_NAMES[1])).to.equal('hl');
        });

        it('should throw an error for invalid fund names', () => {
            expect(() => scraper.getBroker('foo')).to.throw();
        });
    });

    describe('getEligibleFunds', () => {
        it('should map and filter funds by validity', () => {
            const queryResultAllInvalid = [
                { name: 'foo' },
                { name: TEST_FUND_NAMES[0], transactions: null },
                { name: TEST_FUND_NAMES[0], transactions: '' },
                { name: TEST_FUND_NAMES[0], transactions: 'gobbledegook' }
            ];

            expect(scraper.getEligibleFunds(config, logger, queryResultAllInvalid)).to.deep.equal([]);

            const queryResultSomeInvalid = [
                { name: TEST_FUND_NAMES[0], transactions: '' },
                {
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    transactions: JSON.stringify([
                        { date: '2016-06-01', units: 10, cost: 10 },
                        { date: '2017-06-01', units: -10, cost: -8 }
                    ])
                },
                {
                    name: TEST_FUND_NAMES[1],
                    uid: 2,
                    transactions: JSON.stringify([
                        { date: '2016-06-01', units: 100, cost: 240 },
                        { date: '2016-10-01', units: -46, cost: -89 }
                    ])
                },
                {
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    transactions: JSON.stringify([
                        { date: '2016-06-01', units: 0, cost: 10 }
                    ])
                },
                {
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    transactions: JSON.stringify([
                        { date: '2016-06-01', units: 10, cost: 10 }
                    ])
                }
            ];

            expect(scraper.getEligibleFunds(config, logger, queryResultSomeInvalid)).to.deep.equal([
                {
                    hash: fundHash(TEST_FUND_NAMES[1], config.data.funds.salt),
                    broker: 'hl',
                    name: TEST_FUND_NAMES[1],
                    uid: 2,
                    cost: 151,
                    units: 54
                },
                {
                    hash: fundHash(TEST_FUND_NAMES[0], config.data.funds.salt),
                    broker: 'hl',
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    cost: 10,
                    units: 10
                }
            ]);
        });

        it('should filter funds by uniqueness', () => {
            const queryResultSomeDuplicate = [
                {
                    name: TEST_FUND_NAMES[1],
                    uid: 2,
                    transactions: JSON.stringify([
                        { date: '2016-6-1', units: 100, cost: 240 },
                        { date: '2016-10-1', units: -46, cost: -89 }
                    ])
                },
                {
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    transactions: JSON.stringify([
                        { date: '2016-6-1', units: 20, cost: 19 }
                    ])
                },
                {
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    transactions: JSON.stringify([
                        { date: '2016-9-1', units: 10, cost: 10 }
                    ])
                }
            ];

            expect(scraper.getEligibleFunds(config, logger, queryResultSomeDuplicate)).to.deep.equal([
                {
                    hash: fundHash(TEST_FUND_NAMES[1], config.data.funds.salt),
                    broker: 'hl',
                    name: TEST_FUND_NAMES[1],
                    uid: 2,
                    cost: 151,
                    units: 54
                },
                {
                    hash: fundHash(TEST_FUND_NAMES[0], config.data.funds.salt),
                    broker: 'hl',
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    cost: 29,
                    units: 30
                }
            ]);
        });
    });
});

