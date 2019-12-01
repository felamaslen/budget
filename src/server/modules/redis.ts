import redis, { RedisClient } from 'redis';
import url from 'url';

import config from '~/server/config';
import { getLogger } from '~/server/modules/logger';

const logger = getLogger('modules/redis');

export default function getRedisClient(key: string = ''): RedisClient {
  const redisConfig = url.parse(config.redisUrl);

  const port = Number(redisConfig.port) || 6379;
  const host = redisConfig.hostname || '127.0.0.1';

  const client = redis.createClient(port, host, { no_ready_check: true });

  if (redisConfig.auth) {
    client.auth(redisConfig.auth);
  }

  client.on('error', (err: Error) => {
    logger.error(`[${key}] ${err.stack}`);
  });

  client.on('ready', () => {
    logger.verbose(`[${key}] Connected`);
  });

  return client;
}
