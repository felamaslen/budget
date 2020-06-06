describe('Health route', () => {
  it('responds to the health endpoint', async () => {
    expect.assertions(2);
    const res = await global.agent.get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      ok: true,
    });
  });
});
