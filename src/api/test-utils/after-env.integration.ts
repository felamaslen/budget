import type { RedisOptions } from 'ioredis';
import nock from 'nock';

import { getServer } from './create-server';
import { seedUser } from '~api/__tests__/fixtures';
import { migrator } from '~api/migrate';
import { getPool } from '~api/modules/db';

jest.mock('ioredis', () => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const Redis = require('ioredis-mock');
  if (typeof Redis === 'object') {
    return {
      Command: { _transformer: { argument: {}, reply: {} } },
    };
  }
  return function RedisClient(options: RedisOptions, ...args: unknown[]): typeof Redis {
    return new Redis(
      {
        ...(options || {}),
        data: {
          stockPriceUpdateTime: '2021-07-02T11:54:19+0100',
          stockPriceLock: null,
        },
      },
      ...args,
    );
  };
});

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
