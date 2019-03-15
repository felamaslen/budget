const { expect } = require('chai');
const scrape = require('~api/scripts/scrapeFunds/scrape');
const config = require('~api/src/config')();
const logger = require('~api/src/modules/logger')(true);

describe('scrapeFunds scrape functions', () => {
    describe('getFundUrl', () => {
        it('should handle broker: HL', () => {
            const fund = { broker: 'hl', name: 'foo (accum.)' };
            expect(scrape.getFundUrl(config, fund)).to.match(/http:\/\/www.hl.co.uk/);
        });
        it('should handle null brokers', () => {
            expect(() => scrape.getFundUrl(config, {})).to.throw('Unknown fund broker');
        });
    });

    describe('getCacheUrlMap', () => {
        it('should map funds to urls to download', () => {
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

            expect(result).to.deep.equal(expectedResult);
        });
    });

});

