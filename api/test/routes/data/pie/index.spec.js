require('dotenv').config();

const expect = require('chai').expect;

const pie = require('~api/src/routes/data/pie');

describe('Pie charts', () => {
    describe('getPieCols', () => {
        it('should return the expected category list', () => {
            expect(pie.getPieCols('funds')).to.deep.equal([
                ['item', 'cost', 'Total']
            ]);

            expect(pie.getPieCols('food')).to.deep.equal([
                ['shop', 'cost', 'Shop cost'],
                ['category', 'cost', 'Category cost']
            ]);

            expect(pie.getPieCols('general')).to.deep.equal([
                ['shop', 'cost', 'Shop cost'],
                ['category', 'cost', 'Category cost']
            ]);

            expect(pie.getPieCols('social')).to.deep.equal([
                ['shop', 'cost', 'Shop cost'],
                ['society', 'cost', 'Society cost']
            ]);

            expect(pie.getPieCols('holiday')).to.deep.equal([
                ['shop', 'cost', 'Shop cost'],
                ['holiday', 'cost', 'Holiday cost']
            ]);
        });
    });

    describe('processQueryResult', () => {
        it('should return results', () => {
            const queryResult = [
                { col: 'Tesco', cost: 41739 },
                { col: 'Sainsburys', cost: 20490 },
                { col: 'Subway', cost: 15647 },
                { col: 'Wetherspoons', cost: 6982 },
                { col: 'Waitrose', cost: 120 },
                { col: 'Boots', cost: 99 }
            ];

            const pieCol = ['shop', 'cost', 'Shop cost'];

            const threshold = 0.05;

            const result = pie.processQueryResult(queryResult, pieCol, threshold);

            const expectedResult = {
                title: 'Shop cost',
                type: 'cost',
                total: 85077,
                data: [
                    ['Tesco', 41739],
                    ['Sainsburys', 20490],
                    ['Subway', 15647],
                    ['Wetherspoons', 6982],
                    ['Other', 219]
                ]
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });
});

