const { expect } = require('chai');
const path = require('path');
const fs = require('fs-extra');
const md5 = require('md5');
const hl = require('~api/scripts/scrapeFunds/hl');
const config = require('~api/src/config')();

let testData = null;
const testFunds = {};
let testFundsList = [];
const testFundsListData = [];

const TEST_FUND_NAMES = {
    shareHLDollar: 'Apple Inc Com Stk NPV (share)',
    fundHL: 'HL Multi-Manager UK Growth (accum.)',
    shareHL: 'City of London Investment Trust ORD 25p (share)'
};

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

function processTestFiles() {
    testFunds.hl = {
        fund: {
            fund: {
                name: TEST_FUND_NAMES.fundHL,
                broker: 'hl',
                uid: 1
            },
            data: testData.testDataFundHL
        },
        shareDollar: {
            fund: {
                name: TEST_FUND_NAMES.shareHLDollar,
                broker: 'hl',
                uid: 1
            },
            data: testData.testDataShareHLDollar
        },
        share: {
            fund: {
                name: TEST_FUND_NAMES.shareHL,
                broker: 'hl',
                uid: 2
            },
            data: testData.testDataShareHL
        }
    };

    testFundsList.push(testFunds.hl.fund.fund);
    testFundsList.push(testFunds.hl.share.fund);
    testFundsList.push(testFunds.hl.shareDollar.fund);

    testFundsList = testFundsList.map(item => ({ ...item, hash: md5(item.name) }));

    testFundsListData.push(testFunds.hl.fund.data);
    testFundsListData.push(testFunds.hl.share.data);
    testFundsListData.push(testFunds.hl.shareDollar.data);
}

function checkTestFiles(done) {
    if (testData) {
        done();

        return;
    }

    if (testData === false) {
        this.skip();

        return;
    }

    const testDataFundHLFile = path.join(__dirname, '../../data/fund-test-hl.html');
    const testDataShareHLFile = path.join(__dirname, '../../data/share-test-hl.html');
    const testDataShareHLDollarFile = path.join(__dirname, '../../data/share-test-hl-dollar.html');

    Promise.all([
        fs.readFile(testDataFundHLFile, 'utf8'),
        fs.readFile(testDataShareHLFile, 'utf8'),
        fs.readFile(testDataShareHLDollarFile, 'utf8')
    ])
        .catch(() => {
            testData = false;

            this.skip();
        })
        .then(([testDataFundHL, testDataShareHL, testDataShareHLDollar]) => {
            testData = {
                testDataFundHL,
                testDataShareHL,
                testDataShareHLDollar
            };

            processTestFiles();

            done();
        })
        .catch(() => {
            // this is needed to prevent "this.skip()" from
            // triggering an unhandled rejection error
        });
}

describe('scrapeFunds HL functions', () => {
    before(checkTestFiles);

    describe('isHLFundShare', () => {
        before(checkTestFiles);

        it('should return the correct status', () => {
            expect(hl.isHLFundShare(testFunds.hl.fund.fund)).to.equal(false);
            expect(hl.isHLFundShare(testFunds.hl.share.fund)).to.equal(true);
            expect(hl.isHLFundShare(testFunds.hl.shareDollar.fund)).to.equal(true);
        });
    });

    describe('getHoldingsFromDataHL', () => {
        before(checkTestFiles);

        it('should return holdings for funds', () => {
            const fund = testFunds.hl.fund.fund;
            const data = testFunds.hl.fund.data;

            const result = hl.getHoldingsFromDataHL(fund, data);

            const expectedResult = holdingsTestData1;

            expect(result).to.deep.equal(expectedResult);
        });

        it('should return holdings for shares', () => {
            const fund = testFunds.hl.share.fund;
            const data = testFunds.hl.share.data;

            const result = hl.getHoldingsFromDataHL(fund, data);

            const expectedResult = holdingsTestData2;

            expect(result).to.deep.equal(expectedResult);
        });

        it('should return null for shares without holdings', () => {
            const fund = testFunds.hl.shareDollar.fund;
            const data = testFunds.hl.shareDollar.data;

            const result = hl.getHoldingsFromDataHL(fund, data);

            expect(result).to.equal(null);
        });
    });

    describe('getPriceFromDataHL', () => {
        describe('data processors', () => {
            before(checkTestFiles);

            const currencyPrices = {
                GBP: 0.76746
            };

            it('should successfully parse the test fund data', () => {
                const result = hl.getPriceFromDataHL(testFunds.hl.fund.data, currencyPrices);

                const expectedResult = 130.31;

                expect(result).to.equal(expectedResult);
            });

            it('should successfully parse the test share data', () => {
                const result = hl.getPriceFromDataHL(testFunds.hl.share.data, currencyPrices);

                const expectedResult = 424.1;

                expect(result).to.equal(expectedResult);
            });

            it('should parse the dollar share data and convert the price from USD to GBP', () => {
                const result = hl.getPriceFromDataHL(testFunds.hl.shareDollar.data, currencyPrices);

                const expectedResult = 22582 * 0.76746;

                expect(result).to.equal(expectedResult);
            });
        });

        it('should handle bad data', () => {
            expect(() => hl.getPriceFromDataHL('flkjsdflksjdf'))
                .to.throw('data formatted incorrectly');
        });
    });

    describe('getFundUrlHL', () => {
        it('should handle funds', () => {
            const fund = {
                name: 'CF Lindsell Train UK Equity Class D (accum.)'
            };

            const url = 'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/c/cf-lindsell-train-uk-equity-class-d-accumulation';

            expect(hl.getFundUrlHL(config, fund)).to.equal(url);
        });

        it('should handle accumulation-inclusive funds', () => {
            const fund = {
                name: 'Threadneedle UK Equity Income Class 1 (accum-inc.)'
            };

            const url = 'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/t/threadneedle-uk-equity-income-class-1-accumulation-inclusive';

            expect(hl.getFundUrlHL(config, fund)).to.equal(url);
        });

        it('should handle shares', () => {
            const fund = {
                name: TEST_FUND_NAMES.shareHL
            };

            const url = 'http://www.hl.co.uk/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p';

            expect(hl.getFundUrlHL(config, fund)).to.equal(url);
        });

        it('should handle dollar shares', () => {
            const fund = {
                name: TEST_FUND_NAMES.shareHLDollar
            };

            const url = 'http://www.hl.co.uk/shares/shares-search-results/a/apple-inc-com-stk-npv';

            expect(hl.getFundUrlHL(config, fund)).to.equal(url);
        });
    });
});

