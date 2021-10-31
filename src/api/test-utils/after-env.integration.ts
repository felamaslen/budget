import nock from 'nock';

import { getServer } from './create-server';
import { seedUser } from '~api/__tests__/fixtures';
import { migrator } from '~api/migrate';
import { getPool } from '~api/modules/db';

const hasRunMap = new Map<'run', boolean>();

beforeAll(async () => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');

  if (!hasRunMap.has('run')) {
    await migrator.up();
    await seedUser();

    hasRunMap.set('run', true);
  }

  global.server = await getServer();
});

afterAll(async () => {
  global.server?.close();
  await getPool().end();

  nock.enableNetConnect();
});
