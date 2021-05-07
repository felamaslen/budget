import nock from 'nock';

import { getServer } from './create-server';
import { seedUser } from '~api/__tests__/fixtures';
import { migrator } from '~api/migrate';

jest.mock('ioredis');

let hasRun = false;

beforeAll(async () => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');

  if (!hasRun) {
    await migrator.up();
    await seedUser();

    hasRun = true;
  }

  global.server = await getServer();
});

afterAll(() => {
  global.server?.close();

  nock.enableNetConnect();
});
