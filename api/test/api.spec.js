/**
 * API tests
 */

require('dotenv').config();
const expect = require('chai').expect;

const api = require('../src/api');
const common = require('./test.common');

describe('API', () => {
    function testRoute(routes, method, path) {
        expect(routes.filter(route => {
            return route.method === method && route.path === path;
        }))
            .to.have.lengthOf(1);
    }

    let app = null;
    before(() => {
        app = new common.DummyExpress();

        api(app, null);
    });

    describe('POST -> /user/login', () => {
        it('should run', () => testRoute(app.routes, 'post', '/user/login'));
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
        it('should run', () => testRoute(app.routes, 'get', '/data/overview'));
    });
    describe('/data/balance', () => {
        it('should run POST route', () => testRoute(app.routes, 'post', '/data/balance'));
        it('should run PUT route', () => testRoute(app.routes, 'put', '/data/balance'));
    });

    describe('GET -> /data/analysis', () => {
        it('should run', () => testRoute(
            app.routes, 'get', '/data/analysis/:period/:groupBy/:pageIndex?')
        );
    });
    describe('GET -> /data/analysis/deep', () => {
        it('should run', () => testRoute(
            app.routes, 'get', '/data/analysis/deep/:category/:period/:groupBy/:pageIndex?')
        );
    });

    describe('GET -> /data/stocks', () => {
        it('should run', () => testRoute(
            app.routes, 'get', '/data/stocks'
        ));
    });

    describe('/data/funds', () => {
        it('should run GET route', () => testRoute(app.routes, 'get', '/data/funds'));
        it('should run POST route', () => testRoute(app.routes, 'post', '/data/funds'));
        it('should run PUT route', () => testRoute(app.routes, 'put', '/data/funds'));
        it('should run DELETE route', () => testRoute(app.routes, 'delete', '/data/funds'));
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

