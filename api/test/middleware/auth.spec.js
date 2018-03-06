/**
 * Spec for authentication middleware
 */

const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;
const { mockReq, mockRes } = require('sinon-express-mock');
const { prepareMockDb } = require('../test.common');
const getConfig = require('../../src/config');
const auth = require('../../src/middleware/auth');

const { db, tracker } = prepareMockDb();

describe('authMiddleware', () => {
    const config = getConfig();

    beforeEach(() => {
        tracker.install();

        tracker.on('query', query => {
            expect(query.method).to.equal('select');
            expect(query.sql).to.equal('select `uid`, `name` from `users` where `api_key` = ?');

            const [token] = query.bindings;

            if (token === 'test_good_api_key') {
                query.response([{ uid: 3, name: 'john' }]);
            }
            else {
                query.response([]);
            }
        });
    });

    afterEach(() => {
        tracker.uninstall();
    });

    describe('checkAuthToken', () => {
        it('should check an authentication token against the database', async () => {
            const { uid, name } = await auth.checkAuthToken(db, 'test_good_api_key');

            expect(uid).to.equal(3);
            expect(name).to.equal('john');
        });

        it('should return null for a bad token', async () => {
            const result = await auth.checkAuthToken(db, 'some_bad_token');

            expect(result).to.equal(null);
        });
    });

    it('should reject requests with no authorization header', async () => {
        const req = mockReq({
            headers: {},
            body: {}
        });
        const res = mockRes();

        await auth.authMiddleware(config, db)(req, res, () => null);

        expect(res.status).to.be.calledWith(401);
        expect(res.json).to.be.calledWith({ errorMessage: config.msg.errorNotAuthorized });
    });

    it('should reject requests with bad tokens', async () => {
        const req = mockReq({
            headers: {
                authorization: 'some_bad_token'
            },
            body: {}
        });
        const res = mockRes();

        await auth.authMiddleware(config, db)(req, res, () => null);

        expect(res.status).to.be.calledWith(401);
        expect(res.json).to.be.calledWith({ errorMessage: config.msg.errorBadAuthorization });
    });

    it('should add user info to request for good tokens', async () => {
        const req = mockReq({
            headers: {
                authorization: 'test_good_api_key'
            },
            body: {}
        });
        const res = mockRes();

        const next = () => null;

        await auth.authMiddleware(config, db)(req, res, next);

        expect(req.user).to.deep.equal({ uid: 3, name: 'john' });
    });
});

