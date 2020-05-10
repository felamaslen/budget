import request, { Request } from 'supertest';
import * as nock from 'nock';

import db from '~api/modules/db';
import { run } from '~api/index';

beforeAll(async () => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');

  await db.seed.run();

  global.server = await run(4444);
  global.agent = request.agent(global.server);

  const {
    body: { uid, apiKey },
  } = await global.agent.post('/api/v4/user/login').send({
    pin: 1234,
  });

  global.uid = uid;
  global.bearerToken = apiKey;

  global.withAuth = (req, token = apiKey): Request => req.set('Authorization', token);
});

afterAll(async () => {
  await new Promise(resolve => global.server.close(resolve));
  await db('users')
    .select()
    .del();

  nock.enableNetConnect();
});
