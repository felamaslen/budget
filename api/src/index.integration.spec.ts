import { createServer, App } from '~api/test-utils/create-server';

describe('Health route', () => {
  let app: App;
  beforeAll(async () => {
    app = await createServer('health');
  });
  afterAll(async () => {
    await app.cleanup();
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
