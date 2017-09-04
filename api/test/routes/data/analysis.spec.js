/**
 * Analysis data spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const analysis = require('../../../src/routes/data/analysis');

describe('/data/analysis', () => {
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
});

