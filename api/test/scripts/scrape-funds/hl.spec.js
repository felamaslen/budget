import test from 'ava';
import memoize from 'fast-memoize';
import path from 'path';
import fs from 'fs-extra';
import {
    isHLFundShare,
    getHoldingsFromDataHL,
    getPriceFromDataHL,
    getFundUrlHL
} from '~api/scripts/scrape-funds/hl';
import config from '~api/config';

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
        name: 'City of London Investment Trust ORD 25p',
        value: 100
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

test('isHLFundShare returning the correct status', async t => {
    const testFunds = await getTestFunds();

    t.false(isHLFundShare(testFunds.hl.fund.fund));
    t.true(isHLFundShare(testFunds.hl.share.fund));
    t.true(isHLFundShare(testFunds.hl.shareDollar.fund));
});

test('getHoldingsFromDataHL returning holdings for funds', async t => {
    const testFunds = await getTestFunds();

    const fund = testFunds.hl.fund.fund;
    const data = testFunds.hl.fund.data;

    const result = getHoldingsFromDataHL(fund, data);

    const expectedResult = holdingsTestData1;

    t.deepEqual(result, expectedResult);
});

test('getHoldingsFromDataHL returns the share name for shares', async t => {
    const testFunds = await getTestFunds();

    const fund = testFunds.hl.share.fund;
    const data = testFunds.hl.share.data;

    const result = getHoldingsFromDataHL(fund, data);

    const expectedResult = holdingsTestData2;

    t.deepEqual(result, expectedResult);
});

const currencyPrices = {
    GBP: 0.76746
};

test('getPriceFromDataHL (data processors) parsing the test fund data', async t => {
    const testFunds = await getTestFunds();

    const result = getPriceFromDataHL(testFunds.hl.fund.data, currencyPrices);

    const expectedResult = 130.31;

    t.is(result, expectedResult);
});

test('getPriceFromDataHL (data processors) parsing the test share data', async t => {
    const testFunds = await getTestFunds();

    const result = getPriceFromDataHL(testFunds.hl.share.data, currencyPrices);

    const expectedResult = 424.1;

    t.is(result, expectedResult);
});

test('getPriceFromDataHL (data processors) parsing  the dollar share data and convert the price from USD to GBP', async t => {
    const testFunds = await getTestFunds();

    const result = getPriceFromDataHL(testFunds.hl.shareDollar.data, currencyPrices);

    const expectedResult = 22582 * 0.76746;

    t.is(result, expectedResult);
});

test('getPriceFromDataHL handling  bad data', t => {
    const err = t.throws(() => getPriceFromDataHL('flkjsdflksjdf'));

    t.is(err.message, 'data formatted incorrectly');
});

test('getFundUrlHL handling  funds', t => {
    const fund = {
        name: 'CF Lindsell Train UK Equity Class D (accum.)'
    };

    const url = 'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/c/cf-lindsell-train-uk-equity-class-d-accumulation';

    t.is(getFundUrlHL(config, fund), url);
});

test('getFundUrlHL handling  accumulation-inclusive funds', t => {
    const fund = {
        name: 'Threadneedle UK Equity Income Class 1 (accum-inc.)'
    };

    const url = 'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/t/threadneedle-uk-equity-income-class-1-accumulation-inclusive';

    t.is(getFundUrlHL(config, fund), url);
});

test('getFundUrlHL handling  shares', t => {
    const fund = {
        name: TEST_FUND_NAMES.shareHL
    };

    const url = 'http://www.hl.co.uk/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p';

    t.is(getFundUrlHL(config, fund), url);
});

test('getFundUrlHL handling  dollar shares', t => {
    const fund = {
        name: TEST_FUND_NAMES.shareHLDollar
    };

    const url = 'http://www.hl.co.uk/shares/shares-search-results/a/apple-inc-com-stk-npv';

    t.is(getFundUrlHL(config, fund), url);
});
