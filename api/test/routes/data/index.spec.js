require('dotenv').config();

const expect = require('chai').expect;

const data = require('../../../src/routes/data');

describe('Data route', () => {
    describe('getOverallStatusCode', () => {
        it('should handle 5xx codes', () => {
            expect(data.getOverallStatusCode([200, 403, 503, 500].map(
                statusCode => {
                    return { statusCode };
                }
            )))
                .to.equal(500);

            expect(data.getOverallStatusCode([200, 403, 503].map(
                statusCode => {
                    return { statusCode };
                }
            )))
                .to.equal(503);
        });

        it('should handle 4xx codes', () => {
            expect(data.getOverallStatusCode([200, 301, 403, 410].map(
                statusCode => {
                    return { statusCode };
                }
            )))
                .to.equal(400);

            expect(data.getOverallStatusCode([200, 301, 403, 400].map(
                statusCode => {
                    return { statusCode };
                }
            )))
                .to.equal(400);

            expect(data.getOverallStatusCode([200, 301, 403].map(
                statusCode => {
                    return { statusCode };
                }
            )))
                .to.equal(403);
        });

        it('should handle 2xx codes', () => {
            expect(data.getOverallStatusCode([200, 201].map(
                statusCode => {
                    return { statusCode };
                }
            )))
                .to.equal(200);

            expect(data.getOverallStatusCode([200, 200, 200].map(
                statusCode => {
                    return { statusCode };
                }
            )))
                .to.equal(200);

            expect(data.getOverallStatusCode([201, 201].map(
                statusCode => {
                    return { statusCode };
                }
            )))
                .to.equal(201);
        });
    });
});

