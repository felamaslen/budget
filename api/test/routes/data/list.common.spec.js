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

    describe('formatResults', () => {
        it('should work as expected', () => {
            const queryResult = [
                { year: 2017, month: 9, date: 2, item: 'foo', category: 'bar' },
                { year: 2017, month: 8, date: 29, item: 'baz', category: 'bak' }
            ];

            const columnMap = {
                item: 'i',
                category: 'k'
            };

            expect(listCommon.formatResults(queryResult, columnMap)).to.deep.equal([
                {
                    'd': [2017, 9, 2], 'i': 'foo', 'k': 'bar'
                },
                {
                    'd': [2017, 8, 29], 'i': 'baz', 'k': 'bak'
                }
            ]);
        });
    });

    describe('getTotalCostQuery', () => {
        it('should return the correct query', () => {
            const db = new common.DummyDb();
            const user = { uid: 1 };

            expect(listCommon.getTotalCostQuery(db, user, 'food')).to.equal(
                'SELECT SUM(cost) AS total FROM food WHERE uid = 1'
            );
        });
    });

    describe('validateDate', () => {
        it('should require valid years', () => {
            expect(() => listCommon.validateDate({})).to.throw('didn\'t provide year');
            [NaN, null, 'foo'].forEach(year => {
                expect(() => listCommon.validateDate(
                    { year, month: 9, date: 1 }
                )).to.throw('invalid year');
            });
        });

        it('should require valid months', () => {
            expect(() => listCommon.validateDate({ year: 2017 }))
                .to.throw('didn\'t provide month');

            [NaN, null, 'foo'].forEach(month => {
                expect(() => listCommon.validateDate(
                    { year: 2017, month, date: 1 }
                )).to.throw('invalid month');
            });

            expect(() => listCommon.validateDate(
                { year: 2017, month: 0, date: 1 })
            )
                .to.throw('month out of range');
            expect(() => listCommon.validateDate(
                { year: 2017, month: -1, date: 1 })
            )
                .to.throw('month out of range');
            expect(() => listCommon.validateDate(
                { year: 2017, month: 13, date: 1 })
            )
                .to.throw('month out of range');
            expect(() => listCommon.validateDate(
                { year: 2017, month: 1000, date: 1 })
            )
                .to.throw('month out of range');
        });
        it('should require valid dates', () => {
            expect(() => listCommon.validateDate({ year: 2017, month: 5 }))
                .to.throw('didn\'t provide date');
            [NaN, null, 'foo'].forEach(date => {
                expect(() => listCommon.validateDate(
                    { year: 2017, month: 5, date }
                )).to.throw('invalid date');
            });

            expect(() => listCommon.validateDate({ year: 2017, month: 1, date: 0 }))
                .to.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2017, month: 1, date: -1 }))
                .to.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2017, month: 1, date: 32 }))
                .to.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2017, month: 1, date: 1000 }))
                .to.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2017, month: 2, date: 29 }))
                .to.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2016, month: 2, date: 29 }))
                .to.not.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2017, month: 3, date: 32 }))
                .to.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2017, month: 4, date: 31 }))
                .to.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2017, month: 5, date: 32 }))
                .to.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2017, month: 6, date: 31 }))
                .to.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2017, month: 7, date: 32 }))
                .to.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2017, month: 8, date: 32 }))
                .to.throw('date out of range');
            expect(() => listCommon.validateDate({ year: 2017, month: 9, date: 31 }))
                .to.throw('date out of range');
        });
    });

    describe('validateInsertData', () => {
        it('should require valid item strings', () => {
            expect(() => listCommon.validateInsertData({
                year: 2017, month: 9, date: 15 }))
                .to.throw('didn\'t provide item');
        });

        it('should require valid costs', () => {
            expect(() => listCommon.validateInsertData({
                year: 2017, month: 9, date: 15, item: 'foo'
            }))
                .to.throw('didn\'t provide cost');

            [NaN, null, 'foo'].forEach(cost => {
                expect(() => listCommon.validateInsertData({
                    year: 2017, month: 9, date: 15, item: 'foo', cost
                }))
                    .to.throw('invalid cost data');
            });
        });

        it('should accept an allRequired parameter', () => {
            expect(() => listCommon.validateInsertData({}, false))
                .to.not.throw();
        });

        it('should accept extra string columns to validate', () => {
            expect(() => listCommon.validateInsertData({
                year: 2017, month: 9, date: 15, item: 'foo', cost: 1
            }, true, [{ name: 'bar' }]))
                .to.throw('didn\'t provide bar');

            expect(() => listCommon.validateInsertData({
                year: 2017, month: 9, date: 15, item: 'foo', cost: 1, bar: 'baz'
            }, true, [{ name: 'bar' }]))
                .to.not.throw();
        });

        it('should accept non-empty rules for extra string columns', () => {
            expect(() => listCommon.validateInsertData({
                year: 2017, month: 9, date: 15, item: 'foo', cost: 1, bar: ''
            }, true, [{ name: 'bar', notEmpty: true }]))
                .to.throw('bar must not be empty');

            expect(() => listCommon.validateInsertData({
                year: 2017, month: 9, date: 15, item: 'foo', cost: 1, bar: ''
            }, true, [{ name: 'bar', notEmpty: false }]))
                .to.not.throw();

            expect(() => listCommon.validateInsertData({
                year: 2017, month: 9, date: 15, item: 'foo', cost: 1, bar: 'baz'
            }, true, [{ name: 'bar', notEmpty: true }]))
                .to.not.throw();
        });

        it('should return the validated data', () => {
            expect(listCommon.validateInsertData({
                year: 2017, month: 9, date: 4, item: 'foo', cost: 10
            }))
                .to.deep.equal({
                    year: 2017, month: 9, date: 4, item: 'foo', cost: 10
                });
        });
    });

    describe('validateUpdateData', () => {
        it('should require a valid id', () => {
            expect(() => listCommon.validateUpdateData({}))
                .to.throw('didn\'t provide id');

            [NaN, null, 'foo'].forEach(id => {
                expect(() => listCommon.validateUpdateData({ id }))
                    .to.throw('invalid id')
            });
        });

        it('should return the id with values', () => {
            expect(listCommon.validateUpdateData({
                id: 1, year: 2017, month: 9, date: 4, item: 'foo', cost: 10
            }))
                .to.deep.equal({
                    id: 1,
                    values: {
                        year: 2017,
                        month: 9,
                        date: 4,
                        item: 'foo',
                        cost: 10
                    }
                });
        });

        it('should require at least one value', () => {
            expect(() => listCommon.validateUpdateData({ id: 1 }))
                .to.throw('no data provided');
        });
    });
});

