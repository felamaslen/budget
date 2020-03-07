import * as nock from 'nock';
import { Server } from 'http';
import request, { Test, SuperTest } from 'supertest';

import { run } from '.';

describe('Server - integration tests', () => {
  let server: Server;
  let agent: SuperTest<Test>;

  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(async () => {
    server = await run(4444);

    agent = request.agent(server);
  });

  afterEach(done => {
    server.close(done);
  });

  it('responds to the health endpoint', async () => {
    const res = await agent.get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
    });
  });
});
