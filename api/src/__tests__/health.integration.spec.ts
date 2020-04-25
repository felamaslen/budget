describe('Server - integration tests (health)', () => {
  it('responds to the health endpoint', async () => {
    const res = await global.agent.get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
    });
  });
});
