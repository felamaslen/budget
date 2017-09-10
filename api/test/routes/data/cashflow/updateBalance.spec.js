/**
 * Spec for update balance functions
 */

require('dotenv').config();
const expect = require('chai').expect;

const common = require('../../../test.common');
const updateBalance = require('../../../../src/routes/data/cashflow/updateBalance');

describe('/api/data/balance', () => {
    describe('updateQuery', () => {
        it('should run the correct query', () => {
            const db = new common.DummyDb();
            const user = { uid: 1 };

            expect(updateBalance.updateQuery(db, user, 2017, 12, 100)).to.equal([
                'INSERT INTO balance (uid, year, month, balance)',
                'VALUES (1, 2017, 12, 100)',
                'ON DUPLICATE KEY UPDATE year = 2017, month = 12, balance = 100'
            ].join(' '));
        });
    });

    describe('validateParams', () => {
        it('should validate the year', () => {
            expect(updateBalance.validateParams({ body: {} })).to.deep.equal({
                isValid: false, param: 'year'
            });
            expect(updateBalance.validateParams({ body: { year: NaN } })).to.deep.equal({
                isValid: false, param: 'year'
            });
        });
        it('should validate the month', () => {
            expect(updateBalance.validateParams({ body: { year: 2017, month: -4 } })).to.deep.equal({
                isValid: false, param: 'month'
            });
            expect(updateBalance.validateParams({ body: { year: 2017, month: 0 } })).to.deep.equal({
                isValid: false, param: 'month'
            });
            expect(updateBalance.validateParams({ body: { year: 2017, month: 13 } })).to.deep.equal({
                isValid: false, param: 'month'
            });
        });
        it('should validate the balance', () => {
            expect(updateBalance.validateParams({
                body: { year: 2017, month: 12, balance: NaN }
            })).to.deep.equal({
                isValid: false, param: 'balance'
            });
        });
        it('should accept valid data', () => {
            const yearTestValues = [2017, 2000, 1956];
            const monthTestValues = [1, 3, 12];
            const balanceTestValues = [-50013, 9923, 0];

            yearTestValues.forEach((year, key) => {
                const month = monthTestValues[key];
                const balance = balanceTestValues[key];

                expect(updateBalance.validateParams({
                    body: { year, month, balance }
                })).to.deep.equal({
                    isValid: true, year, month, balance
                });
            });
        });
    });
});

