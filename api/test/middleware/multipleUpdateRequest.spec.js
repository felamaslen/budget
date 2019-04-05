const test = require('ava');
const middleware = require('~api/src/middleware/multipleUpdateRequest');

test('getOverallStatusCode handling 5xx codes', t => {
    t.is(middleware.getOverallStatusCode([200, 403, 503, 500].map(
        statusCode => ({ statusCode })
    )), 500);

    t.is(middleware.getOverallStatusCode([200, 403, 503].map(
        statusCode => ({ statusCode })
    )), 503);
});

test('getOverallStatusCode handling 4xx codes', t => {
    t.is(middleware.getOverallStatusCode([200, 301, 403, 410].map(
        statusCode => ({ statusCode })
    )), 400);

    t.is(middleware.getOverallStatusCode([200, 301, 403, 400].map(
        statusCode => ({ statusCode })
    )), 400);

    t.is(middleware.getOverallStatusCode([200, 301, 403].map(
        statusCode => ({ statusCode })
    )), 403);
});

test('getOverallStatusCode handling 2xx codes', t => {
    t.is(middleware.getOverallStatusCode([200, 201].map(
        statusCode => ({ statusCode })
    )), 200);

    t.is(middleware.getOverallStatusCode([200, 200, 200].map(
        statusCode => ({ statusCode })
    )), 200);

    t.is(middleware.getOverallStatusCode([201, 201].map(
        statusCode => ({ statusCode })
    )), 201);
});

