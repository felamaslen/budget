/**
 * user API spec
 */

const expect = require('chai').expect;
require('it-each')();

const sha1 = require('sha1');

require('dotenv').config();

const config = require('../../../src/config')();
const common = require('../../common');
const user = require('../../../src/routes/user');

const loginBanPreCheck = require('./loginBanPreCheck.test');

describe('/api/user', () => {
    describe('userPinHash', () => {
        it('should hash a pin with a salt', () => {
            expect(user.userPinHash(1234, 'foo')).to.equal(sha1('1234foo'));
        });
    });

    describe('generateToken', () => {
        it('should generate a salted hash value', () => {
            expect(user.generateToken(1234)).to.equal(sha1(`1234${config.userHashSalt}`));
        });
    });

    describe('checkAuthToken', () => {
        it('should check an authentication token against the database', async () => {
            const db = new common.DummyDb();

            await user.checkAuthToken(db, 'foo_token');

            expect(db.queries[0]).to.equal(
                'SELECT uid, user AS name FROM users WHERE api_key = \'foo_token\''
            );
        });
    });

    describe('processLoginRequest', () => {
        const testReq = {
            body: {
                pin: '8873'
            }
        };

        const requests = [
            Object.assign(testReq, {
                headers: { 'x-forwarded-for': '144.201.99.41' }
            }),
            Object.assign(testReq, {
                connection: { remoteAddress: '144.201.99.41' }
            })
        ];

        it.each(requests, 'should retrieve the IP, hash and token for a request', req => {
            const expectedResult = {
                ip: '144.201.99.41',
                hash: sha1(`8873${config.userHashSalt}`),
                token: sha1(`8873${config.userHashSalt}`)
            };

            expect(user.processLoginRequest(req)).to.deep.equal(expectedResult);
        });
    });

    describe('findUser', () => {
        it('should find a user by their hash', async () => {
            const db = new common.DummyDb();

            await user.findUser(db, 'some_hash');

            expect(db.queries[0]).to.equal(
                'SELECT uid, user, api_key FROM users WHERE api_key = \'some_hash\' LIMIT 1'
            );
        });
    });

    describe('getIpLog', () => {
        it('should query the database for an IP request log', async () => {
            const db = new common.DummyDb();

            await user.getIpLog(db, '123.123.231.132');

            expect(db.queries[0]).to.equal(
                'SELECT time, count FROM ip_login_req ' +
                'WHERE ip = \'123.123.231.132\' LIMIT 1'
            );
        });
    });

    describe('removeIpLog', () => {
        it('should query the database to remove an IP request log', async () => {
            const db = new common.DummyDb();

            await user.removeIpLog(db, '123.123.231.132');

            expect(db.queries[0]).to.equal(
                'DELETE FROM ip_login_req ' +
                'WHERE ip = \'123.123.231.132\''
            );
        });
    });

    describe('updateIpLog', () => {
        it('should query the database to update an IP request log', async () => {
            const db = new common.DummyDb();

            await user.updateIpLog(db, '123.123.231.132', 1181923991239, 4);

            expect(db.queries[0]).to.equal(
                'INSERT INTO ip_login_req (ip, time, count) ' +
                'VALUES(\'123.123.231.132\', 1181923991239, 4) ' +
                'ON DUPLICATE KEY UPDATE time = 1181923991239, count = 4'
            );
        });
    });

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

    describe('loginBanPreCheck', loginBanPreCheck);

    describe('handleLoginStatus', () => {
        it('should respond with a banned message for banned IPs', () => {
            const res = new common.Res();
            user.handleLoginStatus(res, { banned: true }, null);

            expect(res.statusCode).to.equal(401);
            expect(res.response).to.deep.equal({
                error: true,
                errorMessage: 'Banned'
            });
        });

        it('should respond with an unauthorised message for bad logins', () => {
            const res = new common.Res();
            user.handleLoginStatus(res, { user: null }, null);

            expect(res.statusCode).to.equal(401);
            expect(res.response).to.deep.equal({
                error: true,
                errorMessage: 'Bad PIN'
            });
        });

        it('should respond with user details for good logins', () => {
            const res = new common.Res();
            user.handleLoginStatus(res, { user: { uid: 1, name: 'johnsmith' } }, 'test_token');

            expect(res.statusCode).to.equal(200);
            expect(res.response).to.deep.equal({
                error: false,
                'api_key': 'test_token',
                uid: 1,
                name: 'johnsmith'
            });
        });
    });
});

