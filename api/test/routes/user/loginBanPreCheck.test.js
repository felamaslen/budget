const expect = require('chai').expect;

const common = require('../../common');
const user = require('../../../src/routes/user');
const config = require('../../../src/config')();

module.exports = () => {
    let db = null;
    const ip = '1.2.3.4';
    const testUser = {
        uid: 1,
        name: 'johnsmith',
        'api_key': 'test_good_api_key'
    };

    before(() => {
        db = new common.DummyDbWithUser();
    });

    it('should accept good login #1', async () => {
        const goodLogin1 = await user.loginBanPreCheck(db, 'test_good_api_key', ip);

        expect(goodLogin1).to.deep.equal({
            user: testUser,
            banned: false
        });

        expect(db.ipLog).to.deep.equal([]);
    });

    it('should reject bad login #1 (but not ban)', async () => {
        const badLogin1 = await user.loginBanPreCheck(db, 'blah', ip);

        expect(badLogin1).to.deep.equal({ user: null, banned: false });

        expect(db.ipLog).to.have.lengthOf(1);
        expect(db.ipLog[0].ip).to.equal(ip);
        expect(db.ipLog[0].count).to.equal(1);
    });

    it('should reject bad login #2 (and ban)', async () => {
        // simulate making lots of bad logins
        db.ipLog[0].count = config.user.banTries;

        const badLogin2 = await user.loginBanPreCheck(db, 'blah', ip);

        expect(badLogin2).to.deep.equal({ user: null, banned: true });

        expect(db.ipLog).to.have.lengthOf(1);
        expect(db.ipLog[0].ip).to.equal(ip);
        expect(db.ipLog[0].count).to.equal(config.user.banTries);
    });

    it('should reject good login #2 (as we are banned)', async () => {
        const goodLogin2 = await user.loginBanPreCheck(db, 'test_good_api_key', ip);

        expect(goodLogin2).to.deep.equal({
            user: testUser,
            banned: true
        });

        expect(db.ipLog).to.have.lengthOf(1);
        expect(db.ipLog[0].ip).to.equal(ip);
        expect(db.ipLog[0].count).to.equal(config.user.banTries);
    });

    it('should accept good login #3 and clear the expired ban', async () => {
        // simulate waiting for the ban to expire
        db.ipLog[0].time -= config.user.banTime + 50;

        const goodLogin3 = await user.loginBanPreCheck(db, 'test_good_api_key', ip);

        expect(goodLogin3).to.deep.equal({
            user: testUser,
            banned: false
        });

        expect(db.ipLog).to.have.lengthOf(0);
    });

    it('should ignore expired IP logs', async () => {
        // simulate making lots of bad logins, almost to the point of being banned
        await user.loginBanPreCheck(db, 'blah2', ip);
        db.ipLog[0].count = config.user.banTries - 2;

        // simulate waiting for the log to expire
        db.ipLog[0].time -= config.user.banLimit + 50;

        // complete the ban tries limit and check if we're banned
        await user.loginBanPreCheck(db, 'blah2', ip);
        await user.loginBanPreCheck(db, 'blah2', ip);
        const result = await user.loginBanPreCheck(db, 'blah2', ip);

        expect(result).to.deep.equal({ user: null, banned: false });
        expect(db.ipLog[0].count).to.equal(3);
    });
};

