/**
 * Funds data spec
 */

require('dotenv').config();
const expect = require('chai').expect;
const md5 = require('md5');

const common = require('../../../test.common');

const config = require('../../../../src/config')();
const funds = require('../../../../src/routes/data/funds');

describe('/data/funds', () => {
    describe('getLatestCachedValues', () => {
        it('should return the correct query', () => {
            const db = new common.DummyDb();

            expect(funds.getLatestCachedPricesQuery(db)).to.equal([
                'SELECT fh.hash,',
                'GROUP_CONCAT(fc.price ORDER BY ct.time DESC) AS prices',
                'FROM fund_cache_time ct',
                'INNER JOIN fund_cache fc ON fc.cid = ct.cid',
                'INNER JOIN fund_hash fh ON fh.fid = fc.fid',
                'GROUP BY fc.fid'
            ].join(' '));
        });
    });

    describe('fundHash', () => {
        it('should return a valid hashed value', () => {
            expect(funds.fundHash('foobar')).to.equal(
                md5(`foobar${config.data.fundSalt}`)
            );
        });
    });
});

