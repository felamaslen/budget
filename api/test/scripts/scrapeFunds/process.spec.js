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
                { uid: 1, item: TEST_FUND_NAMES[0], units: null, cost: null },
                { uid: 1, item: TEST_FUND_NAMES[1], units: 5, cost: 3 },
                { uid: 2, item: TEST_FUND_NAMES[1], units: -5, cost: -2 }
            ];

            expect(scraper.getEligibleFunds(config, logger, queryResultAllInvalid)).to.deep.equal([]);

            const queryResultSomeInvalid = [
                {
                    uid: 1,
                    item: TEST_FUND_NAMES[0]
                },
                {
                    uid: 1,
                    item: TEST_FUND_NAMES[0],
                    units: 10
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
                    units: 100
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
                    units: 10,
                    cost: 10
                }
            ];

            expect(scraper.getEligibleFunds(config, logger, queryResultSomeInvalid)).to.deep.equal([
                {
                    uid: 1,
                    hash: fundHash(TEST_FUND_NAMES[0], config.data.funds.salt),
                    broker: 'hl',
                    name: TEST_FUND_NAMES[0],
                    units: 10
                },
                {
                    uid: 2,
                    hash: fundHash(TEST_FUND_NAMES[1], config.data.funds.salt),
                    broker: 'hl',
                    name: TEST_FUND_NAMES[1],
                    units: 54
                }
            ]);
        });

        it('should filter funds by uniqueness', () => {
            const queryResultSomeDuplicate = [
                {
                    uid: 1,
                    item: TEST_FUND_NAMES[1],
                    units: 100
                },
                {
                    uid: 1,
                    item: TEST_FUND_NAMES[1],
                    units: -46
                },
                {
                    uid: 2,
                    item: TEST_FUND_NAMES[0],
                    units: 20
                },
                {
                    uid: 2,
                    item: TEST_FUND_NAMES[0],
                    units: 10
                }
            ];

            expect(scraper.getEligibleFunds(config, logger, queryResultSomeDuplicate)).to.deep.equal([
                {
                    uid: 1,
                    hash: fundHash(TEST_FUND_NAMES[1], config.data.funds.salt),
                    broker: 'hl',
                    name: TEST_FUND_NAMES[1],
                    units: 54
                },
                {
                    uid: 2,
                    hash: fundHash(TEST_FUND_NAMES[0], config.data.funds.salt),
                    broker: 'hl',
                    name: TEST_FUND_NAMES[0],
                    units: 30
                }
            ]);
        });
    });
});

