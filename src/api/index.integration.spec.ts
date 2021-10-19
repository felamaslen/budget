import { App, getTestApp } from '~api/test-utils/create-server';

describe('health route', () => {
  let app: App;
  beforeAll(async () => {
    app = await getTestApp();
  });

  it.each`
    endpoint
    ${'liveness'}
    ${'readiness'}
  `('responds to the $endpoint endpoint', async ({ endpoint }) => {
    expect.assertions(2);
    const res = await app.agent.get(`/${endpoint}`);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      ok: true,
    });
  });
});
