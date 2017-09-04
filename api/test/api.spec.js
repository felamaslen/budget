/**
 * API tests
 */

require('dotenv').config();
const expect = require('chai').expect;

const api = require('../src/api');
const common = require('./test.common');

describe('API', () => {
    let app = null;
    before(() => {
        app = new common.DummyExpress();

        api(app, null);
    });

    describe('POST -> /user/login', () => {
        it('should run', () => {
            const routes = app.routes.filter(route => {
                return route.method === 'post' &&
                    route.path === '/user/login';
            });

            expect(routes).to.have.lengthOf(1);
        });
    });

    describe('* -> /data/*', () => {
        let middleware = null;
        before(() => {
            middleware = app.routes.filter(route => {
                return route.method === 'middleware' &&
                    route.path === '/data/*';
            });
        });

        it('should activate authentication middleware', () => {
            const route = middleware.filter(item => {
                return item.callback.name === 'authMiddleware';
            });

            expect(route).to.have.lengthOf(1);
        });

        it('should activate database middleware', () => {
            const route = middleware.filter(item => {
                return item.callback.name === 'dbMiddleware';
            });

            expect(route).to.have.lengthOf(1);
        });

        it('shouldn\'t activate any other middleware', () => {
            expect(middleware).to.have.lengthOf(2);
        });
    });

    describe('GET -> /data/overview', () => {
        it('should run', () => {
            const routes = app.routes.filter(route => {
                return route.method === 'get' &&
                    route.path === '/data/overview';
            });

            expect(routes).to.have.lengthOf(1);
        });
    });

    describe('GET -> /data/analysis', () => {
        it('should run', () => {
            const routes = app.routes.filter(route => {
                return route.method === 'get' &&
                    route.path === '/data/analysis/:period/:groupBy/:pageIndex?';
            });

            expect(routes).to.have.lengthOf(1);
        });
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

