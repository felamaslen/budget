/* eslint-disable no-console */
import nock from 'nock';
import request, { Request } from 'supertest';

import db from './knex';
import { run } from '~api/index';

beforeAll(async () => {
  try {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');

    await db.migrate.latest();
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
  } catch (err) {
    console.error(err.stack);
  }
});

afterAll(async () => {
  try {
    await new Promise((resolve) => global.server.close(resolve));
    await db('users').select().del();

    nock.enableNetConnect();
  } catch (err) {
    console.error(err.stack);
  }
});
