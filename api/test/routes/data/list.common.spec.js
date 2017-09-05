require('dotenv').config();
const expect = require('chai').expect;

const listCommon = require('../../../src/routes/data/list.common');

describe('Common list data functions', () => {
    describe('getQueryLimitCondition', () => {
        it('should return a valid limit condition', () => {
            const now = new Date('2017-09-04');
            const numMonths = 3;

            expect(listCommon.getQueryLimitCondition(now, numMonths)).to.equal(
                '((year > 2017 OR (year = 2017 AND month >= 7)))'
            );
        });
        it('should handle pagination', () => {
            const now = new Date('2017-09-04');
            const numMonths = 5;
            const offset = 1;

            expect(listCommon.getQueryLimitCondition(now, numMonths, offset))
                .to.equal([
                    '((year > 2016 OR (year = 2016 AND month >= 12))',
                    '(year < 2017 OR (year = 2017 AND month <= 4)))'
                ].join(' AND '));
        });
    });
});

