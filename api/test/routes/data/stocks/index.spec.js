/**
 * Stocks data spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const common = require('../../../test.common');

const stocks = require('../../../../src/routes/data/stocks');

describe('/data/stocks', () => {
    describe('getStocks', () => {
        it('should return a valid query', () => {
            const db = new common.DummyDb();
            const user = { uid: 1 };

            expect(stocks.getStocks(db, user)).to.equal([
                'SELECT code, name, SUM(weight * subweight) AS sumWeight',
                'FROM stocks WHERE uid = 1 GROUP BY code, name ORDER BY sumWeight DESC'
            ].join(' '));
        });
    });

    describe('processStocks', () => {
        it('should return valid results', () => {
            const queryResult = [
                { code: 'ABC:DEF', name: 'ABC company', sumWeight: 2 },
                { code: 'XYZ:UVW', name: 'XYZ company', sumWeight: 4 }
            ];

            expect(stocks.processStocks(queryResult)).to.deep.equal({
                stocks: [
                    ['ABC:DEF', 'ABC company', 2],
                    ['XYZ:UVW', 'XYZ company', 4]
                ],
                total: 6
            });
        });
    });
});

