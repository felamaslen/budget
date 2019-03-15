/**
 * Common analysis methods spec
 */

const { expect } = require('chai');
const { DateTime } = require('luxon');

const analysis = require('~api/src/routes/data/analysis/common');

describe('/data/analysis/deep?', () => {
    describe('getCategoryColumn', () => {
        it('should return a group as expected', () => {
            expect(analysis.getCategoryColumn('bills')).to.equal('item');
            expect(analysis.getCategoryColumn('food', 'category')).to.equal('category');
            expect(analysis.getCategoryColumn('general', 'category')).to.equal('category');
            expect(analysis.getCategoryColumn('social', 'category')).to.equal('society');
            expect(analysis.getCategoryColumn('holiday', 'category')).to.equal('holiday');
            expect(analysis.getCategoryColumn(null, 'category')).to.equal('item');
            expect(analysis.getCategoryColumn(null, 'shop')).to.equal('shop');

            expect(analysis.getCategoryColumn(null, null)).to.equal(null);
        });
    });

    describe('periodCondition', () => {
        it('should get weekly periods', () => {
            const now = DateTime.fromISO('2017-09-04');

            const result = analysis.periodCondition(now, 'week');

            expect(result.startTime.toISODate()).to.equal('2017-09-04');
            expect(result.endTime.toISODate()).to.equal('2017-09-10');
            expect(result.description).to.equal('Week beginning September 4, 2017');

            const result3 = analysis.periodCondition(now, 'week', 3);

            expect(result3.startTime.toISODate()).to.equal('2017-08-14');
            expect(result3.endTime.toISODate()).to.equal('2017-08-20');
            expect(result3.description).to.equal('Week beginning August 14, 2017');
        });

        it('should get monthly periods', () => {
            const now = DateTime.fromISO('2017-09-04');

            const result = analysis.periodCondition(now, 'month');

            expect(result.startTime.toISODate()).to.equal('2017-09-01');
            expect(result.endTime.toISODate()).to.equal('2017-09-30');
            expect(result.description).to.equal('September 2017');

            const result10 = analysis.periodCondition(now, 'month', 10);

            expect(result10.startTime.toISODate()).to.equal('2016-11-01');
            expect(result10.endTime.toISODate()).to.equal('2016-11-30');
            expect(result10.description).to.equal('November 2016');
        });

        it('should get yearly periods', () => {
            const now = DateTime.fromISO('2017-09-04');

            const result = analysis.periodCondition(now, 'year');

            expect(result.startTime.toISODate()).to.equal('2017-01-01');
            expect(result.endTime.toISODate()).to.equal('2017-12-31');
            expect(result.description).to.equal('2017');

            const result10 = analysis.periodCondition(now, 'year', 5);

            expect(result10.startTime.toISODate()).to.equal('2012-01-01');
            expect(result10.endTime.toISODate()).to.equal('2012-12-31');
            expect(result10.description).to.equal('2012');
        });
    });
});

