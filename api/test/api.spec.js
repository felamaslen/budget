/**
 * API tests
 */

const expect = require('chai').expect;

const api = require('../src/api');

const common = require('./common');

describe('API routes:', () => {
    let app = null;
    before(() => {
        app = new common.DummyExpress();

        api(app, null);
    });

    it('should run a POST route at /user/login', () => {
        const routes = app.routes
            .filter(route => route.method === 'post' && route.path === '/user/login');

        expect(routes).to.have.lengthOf.greaterThan(0);
    });

    it('should catch unknown requests', () => {
        const badRes = app.test({
            path: '/foo/bar'
        });

        expect(badRes).to.be.an.instanceOf(common.Res);
        expect(badRes.statusCode).to.equal(400);
        expect(badRes.response).to.deep.equal({
            error: true,
            errorMessage: 'Unknown API endpoint'
        });
    });
});

