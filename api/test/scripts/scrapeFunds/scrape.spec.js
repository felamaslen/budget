const test = require('ava');
const scrape = require('~api/scripts/scrapeFunds/scrape');
const config = require('~api/src/config')();
const logger = require('~api/src/modules/logger')(true);

test('getFundUrl handleing  broker: HL', t => {
    const fund = { broker: 'hl', name: 'foo (accum.)' };
    t.regex(scrape.getFundUrl(config, fund), /http:\/\/www.hl.co.uk/);
});
test('getFundUrl handleing  null brokers', t => {
    const err = t.throws(() => scrape.getFundUrl(config, {}));

    t.is(err.message, 'Unknown fund broker');
});

test('getCacheUrlMap mapping funds to urls to download', t => {
    const funds = [
        { name: 'foo (accum.)', broker: 'hl' },
        { name: 'foo (accum.)', broker: 'hl' },
        { name: 'baz (share)', broker: 'hl' }
    ];

    const result = scrape.getCacheUrlMap(config, logger, funds);

    const expectedResult = {
        urls: [
            'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/f/foo-accumulation',
            'http://www.hl.co.uk/shares/shares-search-results/b/baz'
        ],
        urlIndices: [0, 0, 1]
    };

    t.deepEqual(result, expectedResult);
});
