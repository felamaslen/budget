/**
 * Spec for fund price scraper
 */

/* eslint max-lines: 0, max-statements: 0 */

require('dotenv').config();
const expect = require('chai').expect;
const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');

const common = require('../test.common');
const scraper = require('../../scripts/scrapeFunds');

const config = require('../../src/config')();
const { fundHash } = require('../../src/routes/data/funds/common');

class DummyRequest {
    constructor(res) {
        this.props = {};

        this.res = res;

        this.requests = [];
        this.requestHeaders = [];
    }
    defaults(props) {
        this.props = Object.assign({}, this.props, props);

        return this;
    }
    get(options, callback) {
        this.requests.push(options.url);
        this.requestHeaders.push(options.headers);

        return callback(null, { body: this.res(options.url) });
    }
}

class DummyDbWithFundHashes extends common.DummyDb {
    constructor() {
        super();

        this.fundHash = [];
        this.fundCacheTime = [];
        this.fundCache = [];
    }
    query(sql, ...args) {
        const rawQuery = super.query(sql, ...args);

        const selectFid = rawQuery.match(new RegExp([
            '^SELECT fid FROM fund_hash',
            'WHERE hash = \\\'(\\w+)\\\' AND broker = \\\'(\\w+)\\\'$'
        ].join(' ')));

        if (selectFid) {
            const hash = selectFid[1];
            const broker = selectFid[2];

            return this.fundHash.filter(
                item => item.hash === hash && item.broker === broker
            );
        }

        const insertFid = rawQuery.match(new RegExp([
            '^INSERT INTO fund_hash \\(broker, hash\\)',
            'VALUES \\(\\\'(\\w+)\\\', \\\'(\\w+)\\\'\\)'
        ].join(' ')));

        if (insertFid) {
            const fid = this.fundHash.length + 100;
            const broker = insertFid[1];
            const hash = insertFid[2];

            this.fundHash.push({ fid, broker, hash });

            return { insertId: fid };
        }

        const insertCache = rawQuery.match(new RegExp([
            '^INSERT INTO fund_cache \\(cid, fid, price\\)',
            'VALUES \\(([0-9]+), ([0-9]+), (.+)\\)'
        ].join(' ')));

        if (insertCache) {
            const cid = parseInt(insertCache[1], 10);
            const fid = parseInt(insertCache[2], 10);
            const price = parseFloat(insertCache[3], 10);

            this.fundCache.push({ cid, fid, price });
        }

        const insertCid = rawQuery.match(new RegExp([
            '^INSERT INTO fund_cache_time \\(time, done\\)',
            'VALUES \\(([0-9]+), 0\\)'
        ].join(' ')));

        if (insertCid) {
            const cid = this.fundCacheTime.length + 1000;
            const time = parseInt(insertCid[1], 10);
            const done = 0;

            this.fundCacheTime.push({ cid, time, done });

            return { insertId: cid };
        }

        return rawQuery;
    }
}

class DummyDbWithStocks extends common.DummyDb {
    query(sql, ...args) {
        const rawQuery = super.query(sql, ...args);

        if (rawQuery.match(/^SELECT name, code FROM stock_codes$/)) {
            return [
                { name: 'SomeStock', code: 'EXG:SSX' },
                { name: 'Company Blah', code: 'X75:CMPB' },
                { name: 'Company X plc ord 25p', code: 'EXG:CX' }
            ];
        }

        return rawQuery;
    }
}

const TEST_FUND_NAMES = [
    'HL Multi-Manager UK Growth (accum.)',
    'City of London Investment Trust ORD 25p (share)'
];

const holdingsTestData1 = [
    {
        name: 'Majedie UK Equity Class X',
        value: 9.85
    },
    {
        name: 'Woodford CF Woodford Equity Income Class Z',
        value: 9.79
    },
    {
        name: 'J O Hambro CM UK Equity Income Class B',
        value: 9.69
    },
    {
        name: 'Jupiter UK Special Situations Class I',
        value: 9.67
    },
    {
        name: 'River &amp; Mercantile UK Dynamic Equity Class B',
        value: 9.2
    },
    {
        name: 'Lindsell Train UK Equity Class D Accumulation Shares',
        value: 9.17
    },
    {
        name: 'Marlborough UK Micro-Cap Growth Class P',
        value: 9.04
    },
    {
        name: 'Old Mutual Global Investors (Offshore) UK Smaller Companies Focus Class A',
        value: 7.86
    },
    {
        name: 'Marlborough Multi Cap Income Class P',
        value: 7.61
    },
    {
        name: 'AXA Framlington UK Select Opportunities Class ZI',
        value: 6.97
    }
];

const holdingsTestData2 = [
    {
        name: 'British American Tobacco plc Ordinary 25p',
        value: 4.94
    },
    {
        name: 'HSBC Holdings plc Ordinary USD0.50',
        value: 4.34
    },
    {
        name: 'Diageo plc Ordinary 28 101/108p',
        value: 2.95
    },
    {
        name: 'Royal Dutch Shell Plc B Shares EUR0.07',
        value: 2.87
    },
    {
        name: 'Unilever plc Ordinary 3.11p',
        value: 2.73
    },
    {
        name: 'Vodafone Group plc USD0.20 20/21',
        value: 2.71
    },
    {
        name: 'Prudential plc Ordinary 5p',
        value: 2.68
    },
    {
        name: 'GlaxoSmithKline plc Ordinary 25p',
        value: 2.54
    },
    {
        name: 'Lloyds Banking Group plc Ordinary 10p',
        value: 2.53
    },
    {
        name: 'BP Plc Ordinary US$0.25',
        value: 2.5
    }
];

describe('Fund scraper', () => {
    const testFunds = {};
    let testFundsList = [];
    const testFundsListData = [];

    before(async () => {
        const testDataFundHLFile = path.join(__dirname, '../data/fund-test-hl.html');
        const testDataShareHLFile = path.join(__dirname, '../data/share-test-hl.html');

        const testDataFundHL = await fs.readFile(testDataFundHLFile, 'utf8');
        const testDataShareHL = await fs.readFile(testDataShareHLFile, 'utf8');

        testFunds.hl = {
            fund: {
                fund: {
                    name: TEST_FUND_NAMES[0],
                    broker: 'hl',
                    uid: 1
                },
                data: testDataFundHL
            },
            share: {
                fund: {
                    name: TEST_FUND_NAMES[1],
                    broker: 'hl',
                    uid: 2
                },
                data: testDataShareHL
            }
        };

        testFundsList.push(testFunds.hl.fund.fund);
        testFundsList.push(testFunds.hl.share.fund);

        testFundsList = testFundsList.map(item => {
            return Object.assign({}, item, {
                hash: md5(item.name)
            });
        });

        testFundsListData.push(testFunds.hl.fund.data);
        testFundsListData.push(testFunds.hl.share.data);
    });

    describe('isHLFundShare', () => {
        it('should return the correct status', () => {
            expect(scraper.isHLFundShare(testFunds.hl.fund.fund)).to.equal(false);
            expect(scraper.isHLFundShare(testFunds.hl.share.fund)).to.equal(true);
        });
    });

    describe('getHoldingsFromDataHL', () => {
        it('should return holdings for funds', () => {
            const fund = testFunds.hl.fund.fund;
            const data = testFunds.hl.fund.data;

            const result = scraper.getHoldingsFromDataHL(fund, data);

            const expectedResult = holdingsTestData1;

            expect(result).to.deep.equal(expectedResult);
        });

        it('should return holdings for shares', () => {
            const fund = testFunds.hl.share.fund;
            const data = testFunds.hl.share.data;

            const result = scraper.getHoldingsFromDataHL(fund, data);

            const expectedResult = holdingsTestData2;

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('getFundHoldings', () => {
        it('should handle null data', () => {
            const fund = {};
            const data = null;

            expect(() => scraper.getFundHoldings(fund, data))
                .to.throw('data empty');
        });
        it('should handle broker: HL', () => {
            const fund = testFunds.hl.fund.fund;
            const data = testFunds.hl.fund.data;

            expect(() => scraper.getFundHoldings(fund, data))
                .to.not.throw();
        });
        it('should handle null broker', () => {
            const fund = {};
            const data = 'flkjsdflkjsdf';

            expect(() => scraper.getPriceFromData(fund, data))
                .to.throw('unknown broker');
        });
    });

    describe('getHoldingsFromData', () => {
        it('should add holdings to funds', () => {
            const funds = testFundsList;
            const data = testFundsListData;

            const flags = { quiet: true };

            expect(scraper.getHoldingsFromData(funds, data, flags)).to.deep.equal([
                {
                    broker: 'hl',
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    hash: md5(TEST_FUND_NAMES[0]),
                    holdings: holdingsTestData1
                },
                {
                    broker: 'hl',
                    name: TEST_FUND_NAMES[1],
                    uid: 2,
                    hash: md5(TEST_FUND_NAMES[1]),
                    holdings: holdingsTestData2
                }
            ]);
        });

        it('should handle null data', () => {
            const funds = testFundsList.slice(0, 1).concat([{
                broker: 'hl',
                name: 'somename'
            }]);
            const data = testFundsListData.slice(0, 1).concat(['flkjasdlkjsdf']);

            const flags = { quiet: true };

            expect(scraper.getPricesFromData(funds, data, flags)).to.deep.equal([
                {
                    broker: 'hl',
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    hash: md5(TEST_FUND_NAMES[0]),
                    price: 130.31
                },
                {
                    broker: 'hl',
                    name: 'somename',
                    price: null
                }
            ]);
        });
    });

    describe('getPriceFromDataHL', () => {
        it('should successfully parse the test fund data', () => {
            const result = scraper.getPriceFromDataHL(testFunds.hl.fund.data);

            const expectedResult = 130.31;

            expect(result).to.equal(expectedResult);
        });
        it('should successfully parse the test share data', () => {
            const result = scraper.getPriceFromDataHL(testFunds.hl.share.data);

            const expectedResult = 424.1;

            expect(result).to.equal(expectedResult);
        });
        it('should handle bad data', () => {
            expect(() => scraper.getPriceFromDataHL('flkjsdflksjdf'))
                .to.throw('data formatted incorrectly');
        });
    });

    describe('getPriceFromData', () => {
        it('should handle null data', () => {
            const fund = {};
            const data = null;

            expect(() => scraper.getPriceFromData(fund, data))
                .to.throw('data empty');
        });
        it('should handle broker: HL', () => {
            const fund = testFunds.hl.fund.fund;
            const data = testFunds.hl.fund.data;

            expect(scraper.getPriceFromData(fund, data)).to.equal(130.31);
        });
        it('should handle null broker', () => {
            const fund = {};
            const data = 'flkjsdflkjsdf';

            expect(() => scraper.getPriceFromData(fund, data))
                .to.throw('unknown broker');
        });
    });

    describe('getPricesFromData', () => {
        it('should add prices to funds', () => {
            const funds = testFundsList;
            const data = testFundsListData;

            const flags = { quiet: true };

            expect(scraper.getPricesFromData(funds, data, flags)).to.deep.equal([
                {
                    broker: 'hl',
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    hash: md5(TEST_FUND_NAMES[0]),
                    price: 130.31
                },
                {
                    broker: 'hl',
                    name: TEST_FUND_NAMES[1],
                    uid: 2,
                    hash: md5(TEST_FUND_NAMES[1]),
                    price: 424.1
                }
            ]);
        });

        it('should handle null data', () => {
            const funds = testFundsList.slice(0, 1).concat([{
                broker: 'hl',
                name: 'somename'
            }]);
            const data = testFundsListData.slice(0, 1).concat(['flkjasdlkjsdf']);

            const flags = { quiet: true };

            expect(scraper.getPricesFromData(funds, data, flags)).to.deep.equal([
                {
                    broker: 'hl',
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    hash: md5(TEST_FUND_NAMES[0]),
                    price: 130.31
                },
                {
                    broker: 'hl',
                    name: 'somename',
                    price: null
                }
            ]);
        });
    });

    describe('getFundUrlHL', () => {
        it('should handle funds', () => {
            const fund = {
                name: 'CF Lindsell Train UK Equity Class D (accum.)'
            };

            const url = 'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/c/cf-lindsell-train-uk-equity-class-d-accumulation';

            expect(scraper.getFundUrlHL(fund)).to.equal(url);
        });

        it('should handle shares', () => {
            const fund = {
                name: TEST_FUND_NAMES[1]
            };

            const url = 'http://www.hl.co.uk/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p';

            expect(scraper.getFundUrlHL(fund)).to.equal(url);
        });
    });

    describe('getFundUrl', () => {
        it('should handle broker: HL', () => {
            const fund = { broker: 'hl', name: 'foo (accum.)' };
            expect(scraper.getFundUrl(fund)).to.match(/http:\/\/www.hl.co.uk/);
        });
        it('should handle null brokers', () => {
            expect(() => scraper.getFundUrl({})).to.throw('unknown fund broker');
        });
    });

    describe('getCacheUrlMap', () => {
        it('should map funds to urls to download', () => {
            const funds = testFundsList.concat(testFundsList.slice(1));
            const flags = { quiet: true };

            const result = scraper.getCacheUrlMap(funds, flags);

            const expectedResult = {
                urls: [
                    'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/h/hl-multi-manager-uk-growth-accumulation',
                    'http://www.hl.co.uk/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p'
                ],
                urlIndices: [0, 1, 1]
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('downloadUrl', () => {
        let request = null;
        before(() => {
            request = new DummyRequest(url => md5(url));
        });

        it('should download a URL', async () => {
            const url = 'http://example.com/foo/bar.html';
            const flags = { quiet: true };

            const result = await scraper.downloadUrl(url, flags, request);

            expect(result).to.equal('9f3672d594c902bce8b9226eff292a17');

            expect(request.requests[0]).to.equal('http://example.com/foo/bar.html');
            expect(request.props).to.deep.equal({
                jar: true,
                rejectUnauthorized: false,
                followAllRedirects: true
            });
        });
    });

    describe('getRawData', () => {
        let request = null;
        before(() => {
            request = new DummyRequest(url => md5(url));
        });

        it('should return expected data', async () => {
            const funds = testFundsList.concat(testFundsList.slice(1));
            const flags = { quiet: true };

            const data = await scraper.getRawData(funds, flags, request);

            expect(data).to.deep.equal([
                md5('http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/h/hl-multi-manager-uk-growth-accumulation'),
                md5('http://www.hl.co.uk/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p'),
                md5('http://www.hl.co.uk/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p')
            ]);
        });
    });

    describe('getStockCodes', () => {
        it('should return the correct result', async () => {
            const db = new DummyDbWithStocks();

            const result = await scraper.getStockCodes(db);

            const expectedResult = {
                SomeStock: 'EXG:SSX',
                'Company Blah': 'X75:CMPB',
                'Company X plc ord 25p': 'EXG:CX'
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('saveStockCodes', () => {
        it('should return the correct query', async () => {
            const db = new common.DummyDb();

            const stockCodes = {
                SomeStock: 'EXG:SSX',
                'Company Blah': 'X75:CMPB',
                'Company X plc ord 25p': 'EXG:CX'
            };

            const result = await scraper.saveStockCodes(db, stockCodes);

            const expectedResult = [
                'INSERT INTO stock_codes (name, code)',
                'VALUES (\'SomeStock\', \'EXG:SSX\'),',
                '(\'Company Blah\', \'X75:CMPB\'),',
                '(\'Company X plc ord 25p\', \'EXG:CX\')'
            ].join(' ');

            expect(result).to.equal(expectedResult);
        });
    });

    describe('saveStocksList', () => {
        it('should return an insert query', async () => {
            const db = new common.DummyDb();

            const stocksList = [
                { uid: 1, name: 'foo', weight: 1000, subweight: 9.67, code: 'ABC1' },
                { uid: 1, name: 'bar', weight: 1000, subweight: 7.69, code: 'ABC2' },
                { uid: 1, name: 'baz', weight: 2000, subweight: 4.44, code: 'ABC3' },
                { uid: 2, name: 'zab', weight: 1500, subweight: 9.18, code: 'ABC4' }
            ];

            const result = await scraper.saveStocksList(db, stocksList);

            const expectedResult = [
                'INSERT INTO stocks (uid, name, weight, subweight, code)',
                'VALUES (1, \'foo\', 1000, 9.67, \'ABC1\'),',
                '(1, \'bar\', 1000, 7.69, \'ABC2\'),',
                '(1, \'baz\', 2000, 4.44, \'ABC3\'),',
                '(2, \'zab\', 1500, 9.18, \'ABC4\')'
            ].join(' ');

            expect(result).to.equal(expectedResult);
        });
    });

    describe('insertNewSinglePriceCache', () => {
        it('should insert a fund hash if it doesn\'t exist', async () => {
            const db = new DummyDbWithFundHashes();

            const fund = testFundsList[0];

            await scraper.insertNewSinglePriceCache(db, 1000, fund);

            expect(db.fundHash).to.deep.equal([
                { fid: 100, broker: 'hl', hash: md5(TEST_FUND_NAMES[0]) }
            ]);
        });

        it('should use an existing fund hash if there is one', async () => {
            const db = new DummyDbWithFundHashes();
            db.fundHash.push({ fid: 200, broker: 'hl', hash: md5(TEST_FUND_NAMES[0]) });

            const fund = testFundsList[0];

            await scraper.insertNewSinglePriceCache(db, 1000, fund);

            expect(db.fundHash).to.deep.equal([
                { fid: 200, broker: 'hl', hash: md5(TEST_FUND_NAMES[0]) }
            ]);
        });

        it('should insert a fund_cache item', async () => {
            const db = new DummyDbWithFundHashes();

            const fund = testFundsList[0];
            fund.price = 666.456;

            await scraper.insertNewSinglePriceCache(db, 1000, fund);

            expect(db.fundCache).to.deep.equal([
                { fid: 100, cid: 1000, price: 666.456 }
            ]);
        });
    });

    describe('insertNewPriceCache', () => {
        it('should insert new cache items in parallel', async () => {
            const db = new DummyDbWithFundHashes();

            const prices = [101.56, 876.2, 11.330];

            const fundsWithPrices = testFundsList
                .map((fund, key) => Object.assign({}, fund, { price: prices[key] }))
                .concat(testFundsList.slice(1))
                .map(fund => Object.assign({}, fund, { hash: md5(fund.name) }));

            const now = new Date('2017-09-05');
            const nowTimestamp = Math.floor(now.getTime() / 1000);

            await scraper.insertNewPriceCache(db, fundsWithPrices, now);

            expect(db.fundCacheTime).to.have.lengthOf(1);
            expect(db.fundCacheTime[0].cid).to.equal(1000);
            expect(db.fundCacheTime[0].time).to.equal(nowTimestamp);
            expect(db.fundCache).to.have.lengthOf(2);
            expect(db.fundCache[0].cid).to.equal(1000);
            expect(db.fundCache[0].fid).to.equal(100);
            expect(db.fundCache[1].cid).to.equal(1000);
            expect(db.fundCache[1].fid).to.equal(101);

            const next = new Date('2017-09-06');
            const nextTimestamp = Math.floor(next.getTime() / 1000);

            await scraper.insertNewPriceCache(db, fundsWithPrices.reverse(), next);

            expect(db.fundCacheTime).to.have.lengthOf(2);
            expect(db.fundCacheTime[1].cid).to.equal(1001);
            expect(db.fundCacheTime[1].time).to.equal(nextTimestamp);
            expect(db.fundCache).to.have.lengthOf(4);
            expect(db.fundCache[2].cid).to.equal(1001);
            expect(db.fundCache[2].fid).to.equal(101);
            expect(db.fundCache[3].cid).to.equal(1001);
            expect(db.fundCache[3].fid).to.equal(100);
        });
    });

    describe('scrapeFundPrices', () => {
        let db = null;
        before(() => {
            db = new DummyDbWithFundHashes();
        });

        it('should process and insert fund price data', async () => {
            const funds = testFundsList;
            const data = testFundsListData;

            const flags = { quiet: true };

            const now = new Date('2017-09-05');
            const nowTimestamp = Math.floor(now.getTime() / 1000);

            await scraper.scrapeFundPrices(db, funds, data, flags, now);

            expect(db.fundHash).to.have.lengthOf(2);

            expect(db.fundHash[0].fid).to.equal(100);
            expect(db.fundHash[0].hash).to.equal(md5(TEST_FUND_NAMES[0]));
            expect(db.fundHash[0].broker).to.equal('hl');

            expect(db.fundHash[1].fid).to.equal(101);
            expect(db.fundHash[1].hash).to.equal(md5(TEST_FUND_NAMES[1]));
            expect(db.fundHash[1].broker).to.equal('hl');

            expect(db.fundCacheTime).to.have.lengthOf(1);
            expect(db.fundCacheTime[0].cid).to.equal(1000);
            expect(db.fundCacheTime[0].time).to.equal(nowTimestamp);

            expect(db.fundCache).to.have.lengthOf(2);

            expect(db.fundCache[0].cid).to.equal(1000);
            expect(db.fundCache[0].fid).to.equal(100);
            expect(db.fundCache[0].price).to.equal(130.31);

            expect(db.fundCache[1].cid).to.equal(1000);
            expect(db.fundCache[1].fid).to.equal(101);
            expect(db.fundCache[1].price).to.equal(424.1);
        });
    });

    describe('getBroker', () => {
        it('should return HL for valid fund names', () => {
            expect(scraper.getBroker(TEST_FUND_NAMES[0])).to.equal('hl');
            expect(scraper.getBroker(TEST_FUND_NAMES[1])).to.equal('hl');
        });

        it('should throw an error for invalid fund names', () => {
            expect(() => scraper.getBroker('foo')).to.throw('invalid fund name');
        });
    });

    describe('getEligibleFunds', () => {
        it('should return an empty array for an invalid or empty result', () => {
            expect(scraper.getEligibleFunds(null)).to.deep.equal([]);
            expect(scraper.getEligibleFunds(NaN)).to.deep.equal([]);
            expect(scraper.getEligibleFunds([])).to.deep.equal([]);
        });

        it('should map and filter funds by validity', () => {
            const queryResultAllInvalid = [
                {},
                null,
                { name: 'foo' },
                { name: TEST_FUND_NAMES[0], transactions: null },
                { name: TEST_FUND_NAMES[0], transactions: '' },
                { name: TEST_FUND_NAMES[0], transactions: 'gobbledegook' }
            ];

            expect(scraper.getEligibleFunds(queryResultAllInvalid)).to.deep.equal([]);

            const queryResultSomeInvalid = [
                null,
                { name: TEST_FUND_NAMES[0], transactions: '' },
                {
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    transactions: JSON.stringify([
                        { 'd': [2016, 6, 1], 'u': 10, 'c': 10 },
                        { 'd': [2017, 6, 1], 'u': -10, 'c': -8 }
                    ])
                },
                {
                    name: TEST_FUND_NAMES[1],
                    uid: 2,
                    transactions: JSON.stringify([
                        { 'd': [2016, 6, 1], 'u': 100, 'c': 240 },
                        { 'd': [2016, 10, 1], 'u': -46, 'c': -89 }
                    ])
                },
                {
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    transactions: JSON.stringify([
                        { 'd': [2016, 6, 1], 'u': 0, 'c': 10 }
                    ])
                },
                {
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    transactions: JSON.stringify([
                        { 'd': [2016, 6, 1], 'u': 10, 'c': 10 }
                    ])
                }
            ];

            expect(scraper.getEligibleFunds(queryResultSomeInvalid)).to.deep.equal([
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
                        { 'd': [2016, 6, 1], 'u': 100, 'c': 240 },
                        { 'd': [2016, 10, 1], 'u': -46, 'c': -89 }
                    ])
                },
                {
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    transactions: JSON.stringify([
                        { 'd': [2016, 6, 1], 'u': 20, 'c': 19 }
                    ])
                },
                {
                    name: TEST_FUND_NAMES[0],
                    uid: 1,
                    transactions: JSON.stringify([
                        { 'd': [2016, 9, 1], 'u': 10, 'c': 10 }
                    ])
                }
            ];

            expect(scraper.getEligibleFunds(queryResultSomeDuplicate)).to.deep.equal([
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