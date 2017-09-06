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

    describe('getLatestCachedPricesQuery', () => {
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

    describe('getLatestCachedPrices', () => {
        it('should return a map from fund hashes to prices', () => {
            const queryResult = [
                { hash: 'hash1', prices: '100.3,90,86,97' },
                { hash: 'hash2', prices: '20,23,21.5' }
            ];

            expect(funds.getLatestCachedPrices(queryResult)).to.deep.equal({
                hash1: 97,
                hash2: 21.5
            });
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

