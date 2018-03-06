/**
 * Stocks data spec
 */

const { expect } = require('chai');

const stocks = require('../../../../src/routes/data/stocks');

describe('/data/stocks', () => {
    describe('processStocks', () => {
        it('should return valid results', () => {
            const queryResult = [
                { code: 'ABC:DEF', name: 'ABC company', sumWeight: 2 },
                { code: 'XYZ:UVW', name: 'XYZ company', sumWeight: 4 }
            ];

            expect(stocks.processStocks(queryResult, 'fookey')).to.deep.equal({
                stocks: [
                    ['ABC:DEF', 'ABC company', 2],
                    ['XYZ:UVW', 'XYZ company', 4]
                ],
                total: 6,
                apiKey: 'fookey'
            });
        });
    });
});

