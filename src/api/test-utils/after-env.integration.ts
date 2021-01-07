import nock from 'nock';

import { getServer } from './create-server';
import { seedUser } from '~api/__tests__/fixtures';
import { db } from '~api/test-utils/knex';

jest.mock('ioredis');

let hasRun = false;

beforeAll(async () => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');

  if (!hasRun) {
    await db.migrate.latest();
    await seedUser(db);

    hasRun = true;
  }

  global.server = await getServer();
});

afterAll(() => {
  global.server.close();

  nock.enableNetConnect();
});
