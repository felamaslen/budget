import Redis from 'ioredis';

import config from '~api/config';

export const redisClient = new Redis(config.redis);
