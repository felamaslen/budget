/**
 * Funds data spec
 */

require('dotenv').config();
const expect = require('chai').expect;
const md5 = require('md5');

const common = require('../../../test.common');

const funds = require('../../../../src/routes/data/funds');

describe('/data/funds', () => {
    describe('getMaxAge', () => {
        it('should return the correct timestamp', () => {
            const now = new Date('2017-09-05');

            expect(funds.getMaxAge(now, 'year', 1)).to.be.equal(
                Math.floor(new Date('2016-09-05').getTime() / 1000)
            );

            expect(funds.getMaxAge(now, 'year', 3)).to.be.equal(
                Math.floor(new Date('2014-09-05').getTime() / 1000)
            );

            expect(funds.getMaxAge(now, 'month', 6)).to.be.equal(
                Math.floor(new Date('2017-03-06').getTime() / 1000)
            );
        });

        it('should handle invalid parameters', () => {
            const now = new Date('2017-09-05');

            expect(funds.getMaxAge(now, 'year', 0)).to.equal(0);
            expect(funds.getMaxAge(now, 'foo')).to.equal(0);
        });
    });

    describe('getNumResultsQuery', () => {
        it('should return the correct query', () => {
            const db = new common.DummyDb();
            const user = { uid: 1 };

            expect(funds.getNumResultsQuery(db, user, 'somesalt', 10)).to.equal([
                'SELECT COUNT(*) AS numResults FROM (',
                'SELECT c.cid FROM funds AS f',
                'LEFT JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, \'somesalt\'))',
                'LEFT JOIN fund_cache fc ON fh.fid = fc.fid',
                'LEFT JOIN fund_cache_time c ON c.cid = fc.cid AND c.done = 1',
                'AND c.time > 10',
                'WHERE f.uid = 1 GROUP BY c.cid ) results'
            ].join(' '));
        });
    });

    describe('getAllHistoryForFundsQuery', () => {
        it('should return the correct query', () => {
            const db = new common.DummyDb();
            const user = { uid: 1 };

            expect(funds.getAllHistoryForFundsQuery(
                db, user, 'somesalt', 100, 50, 10
            )).to.equal([
                'SELECT * FROM (',
                'SELECT id, time, price, cNum, FLOOR(cNum % (100 / 50)) AS period',
                'FROM (',
                'SELECT id, time, price, (',
                'CASE prices.cid',
                'WHEN @lastCid THEN @cNum',
                'ELSE @cNum := @cNum + 1 END',
                ') AS cNum,',
                '@lastCid := prices.cid AS last_cid',
                'FROM (',
                'SELECT',
                'c.cid,',
                'c.time,',
                'GROUP_CONCAT(f.id',
                'ORDER BY f.year DESC, f.month DESC, f.date DESC',
                ') AS id,',
                'GROUP_CONCAT(fc.price',
                'ORDER BY f.year DESC, f.month DESC, f.date DESC',
                ') AS price',
                'FROM ( SELECT DISTINCT id, year, month, date, item',
                'FROM funds WHERE uid = 1 ) f',
                'INNER JOIN fund_hash fh',
                'ON fh.hash = MD5(CONCAT(f.item, \'somesalt\'))',
                'INNER JOIN fund_cache fc ON fh.fid = fc.fid',
                'INNER JOIN fund_cache_time c ON c.done = 1 AND c.cid = fc.cid',
                'AND c.time > 10',
                'GROUP BY c.cid',
                'ORDER BY time',
                ') prices',
                'JOIN (',
                'SELECT @cNum := -1, @lastCid := 0',
                ') counter',
                ') ranked',
                ') results',
                'WHERE period = 0 OR cNum = 99'
            ].join(' '));
        });
    });

    describe('processFundHistory', () => {
        it('should return expected data', () => {
            const queryResult = [
                {
                    id: '3,22,23,24', time: 1000, price: '96.5,100.2,16.29,1.23'
                },
                {
                    id: '3,22,23,25', time: 1002, price: '97.3,100.03,16.35,67.08'
                },
                {
                    id: '7,3,22,23,25', time: 1003, price: '10.21,97.4,100.1,16.33,67.22'
                },
                {
                    id: '22,25', time: 1005, price: '100.15,66.98'
                }
            ];

            const expectedResult = {
                idMap: {
                    '3': [96.5, 97.3, 97.4],
                    '22': [100.2, 100.03, 100.1, 100.15],
                    '23': [16.29, 16.35, 16.33],
                    '24': [1.23],
                    '25': [0, 67.08, 67.22, 66.98],
                    '7': [0, 0, 10.21]
                },
                startTime: 1000,
                times: [0, 2, 3, 5]
            };

            expect(funds.processFundHistory(queryResult)).to.deep.equal(expectedResult);
        });
    });

    describe('fundHash', () => {
        it('should return a valid hashed value', () => {
            expect(funds.fundHash('foobar', 'somesalt')).to.equal(
                md5('foobarsomesalt')
            );
        });
    });
});

