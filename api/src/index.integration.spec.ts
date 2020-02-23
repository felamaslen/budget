import * as nock from 'nock';
import { Server } from 'http';
import request from 'supertest';

import db from '~api/modules/db';
import { run } from '.';

describe('Server - integration tests', () => {
  let app: Server;

  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
    app = run(4444);
  });

  afterAll(() => {
    app.close();
    nock.enableNetConnect();
  });

  it('responds to the health endpoint', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
    });
  });
});
