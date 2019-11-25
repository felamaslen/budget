import test from 'ava';
import {
    getFundUrl,
    getCacheUrlMap,
} from '~api/scripts/scrape-funds/scrape';
import config from '~api/config';

import { MockLogger } from '~api-test/test.common';

const logger = new MockLogger();

test('getFundUrl handles broker: HL', (t) => {
    const fund = { broker: 'hl', name: 'foo (accum.)' };
    t.regex(getFundUrl(config, fund), /http:\/\/www.hl.co.uk/);
});

test('getFundUrl handles null brokers', (t) => {
    const err = t.throws(() => getFundUrl(config, {}));

    t.is(err.message, 'Unknown fund broker');
});

test('getCacheUrlMap maps funds to urls to download', (t) => {
    const funds = [
        { name: 'foo (accum.)', broker: 'hl' },
        { name: 'foo (accum.)', broker: 'hl' },
        { name: 'baz (share)', broker: 'hl' },
    ];

    const result = getCacheUrlMap(config, logger, funds);

    const expectedResult = {
        urls: [
            'http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/f/foo-accumulation',
            'http://www.hl.co.uk/shares/shares-search-results/b/baz',
        ],
        urlIndices: [0, 0, 1],
    };

    t.deepEqual(result, expectedResult);
});
