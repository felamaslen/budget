const test = require('ava');
const memoize = require('fast-memoize');
const path = require('path');
const fs = require('fs-extra');
const md5 = require('md5');
const hl = require('~api/scripts/scrapeFunds/hl');
const config = require('~api/src/config')();

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

const getTestData = memoize(async () => {
    const testDataFundHLFile = path.resolve(__dirname, '../../data/fund-test-hl.html');
    const testDataShareHLFile = path.resolve(__dirname, '../../data/share-test-hl.html');
    const testDataShareHLDollarFile = path.resolve(__dirname, '../../data/share-test-hl-dollar.html');

    const [
        testDataFundHL,
        testDataShareHL,
        testDataShareHLDollar
    ] = await Promise.all([
        fs.readFile(testDataFundHLFile, 'utf8'),
        fs.readFile(testDataShareHLFile, 'utf8'),
        fs.readFile(testDataShareHLDollarFile, 'utf8')
    ]);

    return {
        testDataFundHL,
        testDataShareHL,
        testDataShareHLDollar
    };
});

const getTestFunds = async () => {
    const data = await getTestData();

    return {
        hl: {
            fund: {
                fund: {
                    name: TEST_FUND_NAMES.fundHL,
                    broker: 'hl',
                    uid: 1
                },
                data: data.testDataFundHL
            },
            shareDollar: {
                fund: {
                    name: TEST_FUND_NAMES.shareHLDollar,
                    broker: 'hl',
                    uid: 1
                },
                data: data.testDataShareHLDollar
            },
            share: {
                fund: {
                    name: TEST_FUND_NAMES.shareHL,
                    broker: 'hl',
                    uid: 2
                },
                data: data.testDataShareHL
            }
        }
    };
};

const getTestFundsList = async () => {
    const data = await getTestData();
    const testFunds = await getTestFunds();

    const testFundsList = [
        testFunds.hl.fund.fund,
        testFunds.hl.share.fund,
        testFunds.hl.shareDollar.fund
    ]
        .map(item => ({ ...item, hash: md5(item.name) }));

    const testFundsListData = [
        testFunds.hl.fund.data,
        testFunds.hl.share.data,
        testFunds.hl.shareDollar.data
    ];

    return { testFundsList, testFundsListData };
};

test('isHLFundShare returning the correct status', async t => {
    const testFunds = await getTestFunds();

    t.false(hl.isHLFundShare(testFunds.hl.fund.fund));
    t.true(hl.isHLFundShare(testFunds.hl.share.fund));
    t.true(hl.isHLFundShare(testFunds.hl.shareDollar.fund));
});

test('getHoldingsFromDataHL returning holdings for funds', async t => {
    const testFunds = await getTestFunds();

    const fund = testFunds.hl.fund.fund;
    const data = testFunds.hl.fund.data;

    const result = hl.getHoldingsFromDataHL(fund, data);

    const expectedResult = holdingsTestData1;

    t.deepEqual(result, expectedResult);
});

test('getHoldingsFromDataHL returning  holdings for shares', async t => {
    const testFunds = await getTestFunds();

    const fund = testFunds.hl.share.fund;
    const data = testFunds.hl.share.data;

    const result = hl.getHoldingsFromDataHL(fund, data);

    const expectedResult = holdingsTestData2;

    t.deepEqual(result, expectedResult);
});

test('getHoldingsFromDataHL returning  null for shares without holdings', async t => {
    const testFunds = await getTestFunds();

    const fund = testFunds.hl.shareDollar.fund;
    const data = testFunds.hl.shareDollar.data;

    const result = hl.getHoldingsFromDataHL(fund, data);

    t.is(result, null);
});

const currencyPrices = {
    GBP: 0.76746
};

test('getPriceFromDataHL (data processors) parsing the test fund data', async t => {
    const testFunds = await getTestFunds();

    const result = hl.getPriceFromDataHL(testFunds.hl.fund.data, currencyPrices);

    const expectedResult = 130.31;

    t.is(result, expectedResult);
});

test('getPriceFromDataHL (data processors) parsing the test share data', async t => {
    const testFunds = await getTestFunds();

    const result = hl.getPriceFromDataHL(testFunds.hl.share.data, currencyPrices);

    const expectedResult = 424.1;

    t.is(result, expectedResult);
});

test('getPriceFromDataHL (data processors) parsing  the dollar share data and convert the price from USD to GBP', async t => {
    const testFunds = await getTestFunds();

    const result = hl.getPriceFromDataHL(testFunds.hl.shareDollar.data, currencyPrices);

    const expectedResult = 22582 * 0.76746;

    t.is(result, expectedResult);
});

test('getPriceFromDataHL handling  bad data', t => {
    const err = t.throws(() => hl.getPriceFromDataHL('flkjsdflksjdf'));

    t.is(err.message, 'data formatted incorrectly');
});

test('getFundUrlHL handling  funds', t => {
    const fund = {
        name: 'CF Lindsell Train UK Equity Class D (accum.)'
    };

    const url = 'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/c/cf-lindsell-train-uk-equity-class-d-accumulation';

    t.is(hl.getFundUrlHL(config, fund), url);
});

test('getFundUrlHL handling  accumulation-inclusive funds', t => {
    const fund = {
        name: 'Threadneedle UK Equity Income Class 1 (accum-inc.)'
    };

    const url = 'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/t/threadneedle-uk-equity-income-class-1-accumulation-inclusive';

    t.is(hl.getFundUrlHL(config, fund), url);
});

test('getFundUrlHL handling  shares', t => {
    const fund = {
        name: TEST_FUND_NAMES.shareHL
    };

    const url = 'http://www.hl.co.uk/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p';

    t.is(hl.getFundUrlHL(config, fund), url);
});

test('getFundUrlHL handling  dollar shares', t => {
    const fund = {
        name: TEST_FUND_NAMES.shareHLDollar
    };

    const url = 'http://www.hl.co.uk/shares/shares-search-results/a/apple-inc-com-stk-npv';

    t.is(hl.getFundUrlHL(config, fund), url);
});

