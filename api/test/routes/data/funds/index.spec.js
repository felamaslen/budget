/**
 * Funds data spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const common = require('../../../test.common');
const funds = require('../../../../src/routes/data/funds');

describe('/data/funds', () => {
    describe('getLatestCachedValues', () => {
        it('should return the correct query', () => {
            const db = new common.DummyDb();

            expect(funds.getLatestCachedValues(db)).to.equal([
                'SELECT fh.hash,',
                'GROUP_CONCAT(fc.price ORDER BY ct.time DESC) AS prices',
                'FROM fund_cache_time ct',
                'INNER JOIN fund_cache fc ON fc.cid = ct.cid',
                'INNER JOIN fund_hash fh ON fh.fid = fc.fid',
                'GROUP BY fc.fid'
            ].join(' '));
        });
    });
});

