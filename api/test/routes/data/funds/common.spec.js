/**
 * Funds data spec
 */

const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;
const { prepareMockDb } = require('../../../test.common');
const md5 = require('md5');
const moment = require('moment');

const funds = require('../../../../src/routes/data/funds/common');

const TEST_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const { db } = prepareMockDb();

describe('/data/funds', () => {
    describe('getMaxAge', () => {
        it('should return the correct timestamp', () => {
            const now = moment(new Date('2017-09-05'));

            expect(funds.getMaxAge(now, 'year', 1)).to.be.equal(
                moment(new Date('2016-09-05')).format(TEST_DATETIME_FORMAT));

            expect(funds.getMaxAge(now, 'year', 3)).to.be.equal(
                moment(new Date('2014-09-05')).format(TEST_DATETIME_FORMAT));

            expect(funds.getMaxAge(now, 'month', 6)).to.be.equal(
                moment(new Date('2017-03-05 01:00')).format(TEST_DATETIME_FORMAT));
        });

        it('should handle invalid parameters', () => {
            const now = moment(new Date('2017-09-05'));

            expect(funds.getMaxAge(now, 'year', 0)).to.equal(0);
            expect(funds.getMaxAge(now, 'foo')).to.equal(0);
        });
    });

    describe('getNumResultsQuery', () => {
        it('should return the correct query', () => {
            const user = { uid: 1 };

            expect(funds.getNumResultsQuery(db, user, 'somesalt', 10)).to.be.an('object');
        });
    });

    describe('getAllHistoryForFundsQuery', () => {
        it('should return the correct query', () => {
            const user = { uid: 1 };

            expect(funds.getAllHistoryForFundsQuery(db, user, 'somesalt', 100, 50, 10)).to.be.an('object');
        });
    });

    describe('processFundHistory', () => {
        it('should return expected data', () => {
            const queryResult = [
                {
                    id: '3,22,23,24', time: new Date('2017-04-03 14:23:49'), price: '96.5,100.2,16.29,1.23'
                },
                {
                    id: '3,22,23,25', time: new Date('2017-04-21 09:00:01'), price: '97.3,100.03,16.35,67.08'
                },
                {
                    id: '7,3,22,23,25', time: new Date('2017-05-01 10:32:43'), price: '10.21,97.4,100.1,16.33,67.22'
                },
                {
                    id: '22,25', time: new Date('2017-05-03 10:31:06'), price: '100.15,66.98'
                }
            ];

            const expectedResult = {
                idMap: {
                    '3': [96.5, 97.3, 97.4],
                    '22': [100.2, 100.03, 100.1, 100.15],
                    '23': [16.29, 16.35, 16.33],
                    '24': [1.23],
                    '25': [67.08, 67.22, 66.98],
                    '7': [10.21]
                },
                startIndex: {
                    '3': 0,
                    '22': 0,
                    '23': 0,
                    '24': 0,
                    '25': 1,
                    '7': 2
                },
                startTime: moment(new Date('2017-04-03 14:23:49')).unix(),
                times: [0, 1535772, 2405334, 2578037]
            };

            expect(funds.processFundHistory(queryResult)).to.deep.equal(expectedResult);
        });
    });

    describe('fundHash', () => {
        it('should return a valid hashed value', () => {
            expect(funds.fundHash('foobar', 'somesalt')).to.equal(
                md5('foobarsomesalt')
            );
        });
    });
});

