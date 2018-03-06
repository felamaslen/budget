/**
 * user API spec
 */

const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;
require('it-each')();
const { mockReq, mockRes } = require('sinon-express-mock');

const sha1 = require('sha1');

const config = require('../../../src/config')();
const { prepareMockDb } = require('../../test.common');
const user = require('../../../src/routes/user');

const { db, tracker } = prepareMockDb();

describe('/api/user', () => {
    describe('userPinHash', () => {
        it('should hash a pin with a salt', () => {
            expect(user.userPinHash(1234, 'foo')).to.equal(sha1('1234foo'));
        });
    });

    describe('generateToken', () => {
        it('should generate a salted hash value', () => {
            expect(user.generateToken(config, 1234)).to.equal(sha1(`1234${config.userHashSalt}`));
        });
    });

    describe('processLoginRequest', () => {
        const testReq = [
            mockReq({
                headers: {
                    'x-forwarded-for': '144.201.99.41'
                },
                body: {
                    pin: '8873'
                }
            }),
            mockReq({
                connection: {
                    remoteAddress: '144.201.99.41'
                },
                body: {
                    pin: '8873'
                }
            })
        ];

        it.each(testReq, 'should retrieve the IP, hash and token for a request', req => {
            const expectedResult = {
                ip: '144.201.99.41',
                hash: sha1(`8873${config.userHashSalt}`),
                token: sha1(`8873${config.userHashSalt}`)
            };

            expect(user.processLoginRequest(config, req)).to.deep.equal(expectedResult);
        });
    });

    describe('findUser', () => {
        before(() => {
            tracker.install();

            tracker.on('query', query => {
                query.response([query.sql]);
            });
        });

        after(() => {
            tracker.uninstall();
        });

        it('should find a user by their hash', async () => {
            const result = await user.findUser(db, 'some_hash');

            expect(result).to.equal(
                'select `uid`, `name`, `api_key` from `users` where `api_key` = ?'
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

    describe('handleLoginStatus', () => {
        it('should respond with a banned message for banned IPs', () => {
            const req = mockReq();
            const res = mockRes();
            user.handleLoginStatus(config, req, res, { banned: true }, null);

            expect(res.status).to.be.calledWith(401);
            expect(res.json).to.be.calledWith({
                errorMessage: 'Banned'
            });
        });

        it('should respond with an unauthorised message for bad logins', () => {
            const req = mockReq();
            const res = mockRes();
            user.handleLoginStatus(config, req, res, { user: null }, null);

            expect(res.status).to.be.calledWith(401);
            expect(res.json).to.be.calledWith({
                errorMessage: 'Bad PIN'
            });
        });

        it('should respond with user details for good logins', () => {
            const req = mockReq();
            const res = mockRes();

            user.handleLoginStatus(config, req, res, {
                user: { uid: 1, name: 'johnsmith' }
            }, 'test_token');

            expect(res.json).to.be.calledWith({
                apiKey: 'test_token',
                uid: 1,
                name: 'johnsmith'
            });
        });
    });
});

