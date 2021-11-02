import nock from 'nock';

import { getServer } from './create-server';
import { seedUser } from '~api/__tests__/fixtures';
import { migrator } from '~api/migrate';
import { getPool } from '~api/modules/db';
import { redisClientSubscriber } from '~api/modules/graphql';
import { redisClient } from '~api/modules/redis';

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
  await redisClient.quit();
  await redisClientSubscriber.quit();

  nock.enableNetConnect();
});
