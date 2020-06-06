import { getOverallStatusCode } from './multiple-update-request';

describe('getOverallStatusCode', () => {
  it('getOverallStatusCode handling 5xx codes', () => {
    expect.assertions(2);

    expect(getOverallStatusCode([200, 403, 503, 500].map((statusCode) => ({ statusCode })))).toBe(
      500,
    );

    expect(getOverallStatusCode([200, 403, 503].map((statusCode) => ({ statusCode })))).toBe(503);
  });

  it('getOverallStatusCode handling 4xx codes', () => {
    expect.assertions(3);

    expect(getOverallStatusCode([200, 301, 403, 410].map((statusCode) => ({ statusCode })))).toBe(
      400,
    );

    expect(getOverallStatusCode([200, 301, 403, 400].map((statusCode) => ({ statusCode })))).toBe(
      400,
    );

    expect(getOverallStatusCode([200, 301, 403].map((statusCode) => ({ statusCode })))).toBe(403);
  });

  it('getOverallStatusCode handling 2xx codes', () => {
    expect.assertions(3);

    expect(getOverallStatusCode([200, 201].map((statusCode) => ({ statusCode })))).toBe(200);

    expect(getOverallStatusCode([200, 200, 200].map((statusCode) => ({ statusCode })))).toBe(200);

    expect(getOverallStatusCode([201, 201].map((statusCode) => ({ statusCode })))).toBe(201);
  });
});
