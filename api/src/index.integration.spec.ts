describe('Health route', () => {
  it.each`
    endpoint
    ${'liveness'}
    ${'readiness'}
  `('responds to the $endpoint endpoint', async ({ endpoint }) => {
    expect.assertions(2);
    const res = await global.agent.get(`/${endpoint}`);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      ok: true,
    });
  });
});
