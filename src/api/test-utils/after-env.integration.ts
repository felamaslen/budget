import type { RedisOptions } from 'ioredis';
import nock from 'nock';

import { getServer } from './create-server';
import { seedUser } from '~api/__tests__/fixtures';
import { migrator } from '~api/migrate';

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
