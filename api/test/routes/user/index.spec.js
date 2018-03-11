/**
 * user API spec
 */

const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;
require('it-each')();

const user = require('../../../src/routes/user');

describe('/api/user', () => {
    describe('getNewBadLoginCount', () => {
        // note that this function is run if and only if a bad login is made

        it('should increment the counter for recent logs', () => {
            expect(user.getNewBadLoginCount(1, false, false, false)).to.equal(2);
            expect(user.getNewBadLoginCount(2, false, false, false)).to.equal(3);
        });

        it('should return the current counter for active bans', () => {
            expect(user.getNewBadLoginCount(1, true, false, false)).to.equal(1);
            expect(user.getNewBadLoginCount(5, true, false, false)).to.equal(5);
        });
        it('should return the current counter for active bans despite an expired log', () => {
            expect(user.getNewBadLoginCount(1, true, true, false)).to.equal(1);
            expect(user.getNewBadLoginCount(5, true, true, false)).to.equal(5);
        });

        it('should reset the counter for expired logs with no ban', () => {
            expect(user.getNewBadLoginCount(4, false, true, false)).to.equal(1);
            expect(user.getNewBadLoginCount(1, false, true, false)).to.equal(1);
        });

        it('should reset the counter for expired bans', () => {
            expect(user.getNewBadLoginCount(4, true, null, true)).to.equal(1);
            expect(user.getNewBadLoginCount(1, true, null, true)).to.equal(1);
        });
    });
});

