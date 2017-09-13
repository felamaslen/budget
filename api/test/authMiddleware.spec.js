/**
 * Spec for authentication middleware
 */

require('dotenv').config();
const expect = require('chai').expect;

const common = require('./test.common');
const authMiddleware = require('../src/authMiddleware');

describe('authMiddleware', () => {
    describe('checkAuthToken', () => {
        it('should check an authentication token against the database', async () => {
            const db = new common.DummyDbWithUser();
            await authMiddleware.checkAuthToken(db, 'foo_token');

            expect(db.queries[0]).to.equal(
                'SELECT uid, user AS name FROM users WHERE api_key = \'foo_token\' LIMIT 1'
            );
        });

        it('should return null for a bad token', async () => {
            const db = new common.DummyDbWithUser();
            const result = await authMiddleware.checkAuthToken(db, 'some_bad_token');

            expect(result).to.equal(null);
        });

        it('should return user info for a good token', async () => {
            const db = new common.DummyDbWithUser();
            const result = await authMiddleware.checkAuthToken(db, 'test_good_api_key');

            expect(result).to.deep.equal({
                uid: 1,
                name: 'johnsmith'
            });
        });
    });

    it('should reject requests with no authorization header', async () => {
        const req = new common.Req();
        const res = new common.Res();

        req.db = new common.DummyDb();

        await authMiddleware.authMiddleware(req, res, () => null);

        expect(res.statusCode).to.equal(401);
        expect(res.response).to.deep.equal({
            error: true,
            errorMessage: 'You need to authenticate to do that'
        });
    });

    it('should reject requests with bad tokens', async () => {
        const req = new common.Req({
            headers: {
                authorization: 'some_bad_token'
            }
        });

        req.db = new common.DummyDbWithUser();

        const res = new common.Res();

        await authMiddleware.authMiddleware(req, res, () => null);

        expect(res.statusCode).to.equal(401);
        expect(res.response).to.deep.equal({
            error: true,
            errorMessage: 'Bad authentication token'
        });
    });

    it('should add user info to request for good tokens', async () => {
        const req = new common.Req({
            headers: {
                authorization: 'test_good_api_key'
            }
        });

        const res = new common.Res();

        req.db = new common.DummyDbWithUser();

        await authMiddleware.authMiddleware(req, res, () => null);

        expect(req.user).to.deep.equal({
            uid: 1,
            name: 'johnsmith'
        });
    });
});

