/**
 * Analysis (deep) data spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const common = require('../../../test.common');
const analysis = require('~api/src/routes/data/analysis/deep');

describe('/data/analysis/deep', () => {
    describe('getPeriodCostDeep', () => {
        it('should get items data with cost', async () => {
            const db = new common.DummyDbWithAnalysis();
            const user = { uid: 1 };
            const now = new Date('2017-09-04');
            const category = 'food';
            const period = 'month';
            const groupBy = 'category';
            const pageIndex = 0;

            const result = await analysis.getPeriodCostDeep(
                db, user, now, period, groupBy, pageIndex, category
            );

            const expectedResult = [
                { cost: 80, item: 'Flour', itemCol: 'Bread' },
                { cost: 130, item: 'Eggs', itemCol: 'Dairy' }
            ];

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('processDataResponse', () => {
        it('should process query response properly', () => {
            const queryResponse = [
                { cost: 80, item: 'Flour', itemCol: 'Bread' },
                { cost: 95, item: 'Milk', itemCol: 'Dairy' },
                { cost: 130, item: 'Eggs', itemCol: 'Dairy' }
            ];

            const expectedResult = [
                [
                    'Bread',
                    [
                        ['Flour', 80]
                    ]
                ],
                [
                    'Dairy',
                    [
                        ['Milk', 95],
                        ['Eggs', 130]
                    ]
                ]
            ];

            expect(analysis.processDataResponse(queryResponse)).to.deep.equal(expectedResult);
        });
    });
});

