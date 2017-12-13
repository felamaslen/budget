/**
 * Analysis data spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const common = require('../../../test.common');
const analysis = require('../../../../src/routes/data/analysis');

describe('/data/analysis', () => {
    describe('getPeriodCostForCategory', () => {
        it('should get valid data', async () => {
            const db = new common.DummyDbWithAnalysis();
            const user = { uid: 1 };

            const result = await analysis.getPeriodCostForCategory(
                db, user, 'year = 2015', 'food', 'category'
            );

            expect(result).to.deep.equal([
                { itemCol: 'f', cost: 10 },
                { itemCol: 'g', cost: 103 }
            ]);
        });
    });

    describe('getPeriodCost', () => {
        it('should get cost data and a period description', async () => {
            const db = new common.DummyDbWithAnalysis();
            const user = { uid: 1 };
            const now = new Date('2017-09-04');
            const period = 'month';
            const groupBy = 'category';
            const pageIndex = 0;

            const result = await analysis.getPeriodCost(
                db, user, now, period, groupBy, pageIndex
            );

            const expectedResult = {
                timeline: new Array(30).fill([]),
                cost: [
                    ['bills', [
                        ['a', 999], ['b', 1923], ['c', 110], ['d', 91], ['e', 110]]
                    ],
                    ['food', [['f', 10], ['g', 103]]],
                    ['general', [['f', 10], ['g', 103]]],
                    ['holiday', [['m', 191239], ['n', 9912]]],
                    ['social', [['k', 15], ['l', 1000]]]
                ],
                saved: 0,
                description: 'Sep 2017'
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('getTimeline', () => {
        it('should be tested');
    });
});

