require('dotenv').config();
const expect = require('chai').expect;

const common = require('../../test.common');
const listCommon = require('../../../src/routes/data/list.common');

describe('Common list data functions', () => {
    describe('getLimitCondition', () => {
        it('should return a valid limit condition', () => {
            const now = new Date('2017-09-04');
            const numMonths = 3;

            expect(listCommon.getLimitCondition(now, numMonths)).to.deep.equal({
                startYear: 2017,
                startMonth: 7,
                endYear: 2017,
                endMonth: 9
            });
        });
        it('should handle pagination', () => {
            const now = new Date('2017-09-04');
            const numMonths = 5;
            const offset = 1;

            expect(listCommon.getLimitCondition(now, numMonths, offset)).to.deep.equal({
                startYear: 2016,
                startMonth: 12,
                endYear: 2017,
                endMonth: 4
            });
        });
    });

    describe('getQueryLimitCondition', () => {
        it('should return a valid query limit condition', () => {
            const startYear = 2016;
            const startMonth = 12;
            const endYear = 2017;
            const endMonth = 4;

            expect(listCommon.getQueryLimitCondition(
                startYear, startMonth, endYear, endMonth, true
            ))
                .to.equal([
                    '((year > 2016 OR (year = 2016 AND month >= 12))',
                    '(year < 2017 OR (year = 2017 AND month <= 4)))'
                ].join(' AND '));
        });
        it('should not filter items from the future', () => {
            const startYear = 2017;
            const startMonth = 7;
            const endYear = 2017;
            const endMonth = 9;

            expect(listCommon.getQueryLimitCondition(
                startYear, startMonth, endYear, endMonth, false
            ))
                .to.equal(
                    '((year > 2017 OR (year = 2017 AND month >= 7)))'
                );
        });
    });

    describe('getOlderExistsQuery', () => {
        it('should return the correct query', () => {
            const db = new common.DummyDb();
            const user = { uid: 1 };
            const table = 'food';
            const startYear = 2017;
            const startMonth = 7;

            expect(listCommon.getOlderExistsQuery(
                db, user, table, startYear, startMonth)
            )
                .to.equal([
                    'SELECT COUNT(*) AS count FROM food WHERE uid = 1 AND (',
                    'year < 2017 OR (year = 2017 AND month < 7) )'
                ].join(' '));
        });
    });

    describe('getQuery', () => {
        it('should return the correct query', () => {
            const db = new common.DummyDb();
            const user = { uid: 1 };
            const table = 'food';
            const columns = ['date', 'item', 'category', 'cost', 'shop'];

            expect(listCommon.getQuery(db, user, table, columns)).to.equal([
                'SELECT date, item, category, cost, shop FROM food',
                'WHERE uid = 1',
                'ORDER BY year DESC, month DESC, date DESC, id DESC'
            ].join(' '));
        });
        it('should handle pagination condition', () => {
            const db = new common.DummyDb();
            const user = { uid: 1 };
            const table = 'food';
            const columns = ['foo', 'bar'];
            const limitCondition = 'somecondition';

            expect(listCommon.getQuery(db, user, table, columns, limitCondition))
                .to.equal('SELECT foo, bar FROM food WHERE uid = 1 AND somecondition' +
                    ' ORDER BY year DESC, month DESC, date DESC, id DESC');
        });
    });
});

