const expect = require('chai').expect;

const common = require('../../common');
const user = require('../../../src/routes/user');
const config = require('../../../src/config')();

class DummyDbWithUser extends common.DummyDb {
    constructor() {
        super();

        this.ipLog = [];
    }
    handleLogin(match) {
        const testGoodApiKey = 'test_good_api_key';

        if (match[1] === testGoodApiKey) {
            return [{
                uid: 1,
                name: 'johnsmith',
                'api_key': testGoodApiKey
            }];
        }

        return [];
    }
    handleGetIpLog(match) {
        const ip = match[1];

        return this.ipLog
            .filter(item => item.ip === ip);
    }
    handleRemoveIpLog(match, query) {
        const ip = match[1];

        this.ipLog = this.ipLog.filter(item => item.ip !== ip);

        return query;
    }
    handleUpdateIpLog(match, query) {
        const ip = match[1];
        const time = parseInt(match[2], 10);
        const count = parseInt(match[3], 10);

        const index = this.ipLog.findIndex(item => item.ip === ip);
        if (index === -1) {
            this.ipLog.push({ ip, time, count });
        }
        else {
            this.ipLog[index].time = time;
            this.ipLog[index].count = count;
        }

        return query;
    }
    query(sql, ...args) {
        const rawQuery = super.query(sql, ...args);

        const getUserQueryMatch = rawQuery.match(
            /^SELECT uid, user, api_key FROM users WHERE api_key = '(\w+)' LIMIT 1$/
        );

        const getIpLogMatch = rawQuery.match(
            /^SELECT time, count FROM ip_login_req WHERE ip = '([0-9.]+)' LIMIT 1$/
        );

        const removeIpLogMatch = rawQuery.match(
            /^DELETE FROM ip_login_req WHERE ip = '([0-9.]+)'$/
        );

        const updateIpLogMatch = rawQuery.match(new RegExp(
            '^INSERT INTO ip_login_req \\(ip, time, count\\) ' +
            'VALUES\\(\'([0-9.]+)\', ([0-9]+), ([0-9]+)\\) ' +
            'ON DUPLICATE KEY UPDATE time = \\2, count = \\3'
        ));

        // console.log({ rawQuery, getUserQueryMatch, removeIpLogMatch, getIpLogMatch, updateIpLogMatch });

        if (getUserQueryMatch) {
            return this.handleLogin(getUserQueryMatch);
        }

        if (getIpLogMatch) {
            return this.handleGetIpLog(getIpLogMatch);
        }

        if (removeIpLogMatch) {
            return this.handleRemoveIpLog(removeIpLogMatch, rawQuery);
        }

        if (updateIpLogMatch) {
            return this.handleUpdateIpLog(updateIpLogMatch, rawQuery);
        }

        return rawQuery;
    }
}

module.exports = () => {
    let db = null;
    const ip = '1.2.3.4';
    const testUser = {
        uid: 1,
        name: 'johnsmith',
        'api_key': 'test_good_api_key'
    };

    before(() => {
        db = new DummyDbWithUser();
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

