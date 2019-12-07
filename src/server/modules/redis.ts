import redis, { RedisClient } from 'redis';
import url from 'url';

import config from '~/server/config';
import { getLogger } from '~/server/modules/logger';

const logger = getLogger('modules/redis');

export function getRedisConfig(): {
  port: number;
  host: string;
  auth: string | null;
} {
  const redisConfig = url.parse(config.redisUrl);

  const port = Number(redisConfig.port) || 6379;
  const host = redisConfig.hostname || '127.0.0.1';

  return {
    auth: redisConfig.auth,
    port,
    host,
  };
}

export default function getRedisClient(key = ''): RedisClient {
  const redisConfig = getRedisConfig();

  // eslint-disable-next-line @typescript-eslint/camelcase
  const client = redis.createClient(redisConfig.port, redisConfig.host, { no_ready_check: true });

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
