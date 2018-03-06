const { expect } = require('chai');
const { prepareMockDb } = require('../../test.common');
const moment = require('moment');

const common = require('../../test.common');
const listCommon = require('../../../src/routes/data/list.common');

const { db, tracker } = prepareMockDb();

const TEST_DATE_FORMAT = 'YYYY-MM-DD';

describe('Common list data functions', () => {
    describe('getLimitCondition', () => {
        it('should return a valid limit condition', () => {
            const now = moment(new Date('2017-09-04'));
            const numMonths = 3;

            const result = listCommon.getLimitCondition(now, { numMonths });

            expect(Object.keys(result).reduce((items, key) => ({
                ...items,
                [key]: result[key]
                    ? result[key].format(TEST_DATE_FORMAT)
                    : null
            }), {}))
                .to.deep.equal({
                    startDate: '2017-09-01',
                    endDate: null
                });
        });
        it('should handle pagination', () => {
            const now = moment(new Date('2017-09-03'));
            const numMonths = 5;
            const offset = 1;

            const result = listCommon.getLimitCondition(now, { numMonths, offset });

            expect(Object.keys(result).reduce((items, key) => ({
                ...items,
                [key]: result[key]
                    ? result[key].format(TEST_DATE_FORMAT)
                    : null
            }), {}))
                .to.deep.equal({
                    startDate: '2016-12-01',
                    endDate: '2017-04-30'
                });
        });
    });

    describe('getOlderExists', () => {
        before(() => {
            tracker.install();

            tracker.on('query', query => {
                expect(query.sql).to.equal(
                    'select COUNT(*) AS count from `food` where `date` < ? and `uid` = ?');

                query.response([{ count: 156 }]);
            });
        });

        after(() => {
            tracker.uninstall();
        });

        it('should return the correct query', () => {
            const user = { uid: 1 };
            const table = 'food';
            const startDate = moment('2017-07-01');

            listCommon.getOlderExists(db, user, table, { startDate });
        });
    });

    describe('formatResults', () => {
        it('should work as expected', () => {
            const queryResult = [
                { date: new Date('2017-09-12'), item: 'foo', category: 'bar' },
                { date: new Date('2017-08-29'), item: 'baz', category: 'bak' }
            ];

            const columnMap = {
                item: 'i',
                category: 'k'
            };

            expect(listCommon.formatResults(queryResult, columnMap)).to.deep.equal([
                {
                    'd': '2017-09-12', 'i': 'foo', 'k': 'bar'
                },
                {
                    'd': '2017-08-29', 'i': 'baz', 'k': 'bak'
                }
            ]);
        });
    });

    describe('getTotalCost', () => {
        before(() => {
            tracker.install();

            tracker.on('query', query => {
                query.response([{ total: 8147 }]);
            });
        });

        after(() => {
            tracker.uninstall();
        });

        it('should return the correct query', async () => {
            const user = { uid: 1 };

            expect(await listCommon.getTotalCost(db, user, 'food')).to.equal(8147);
        });
    });
});

