/**
 * Spec for update balance functions
 */

const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;

const { prepareMockDb } = require('../../../test.common');
const updateBalance = require('../../../../src/routes/data/cashflow/updateBalance');

const { db, tracker } = prepareMockDb();

describe('/api/data/balance', () => {
    describe('updateQuery', () => {
        before(() => {
            tracker.install();

            tracker.on('query', query => {
                expect(query.sql).to.equal('insert into balance (uid, date, value) values (?, ?, ?) on duplicate key update uid = ?, value = ?');
            });
        });

        after(() => {
            tracker.uninstall();
        });

        it('should run the correct query', () => {
            const user = { uid: 1 };

            updateBalance.updateQuery(db, user, { year: 2017, month: 12, balance: 100 });
        });
    });
});

