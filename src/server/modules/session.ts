import Koa from 'koa';
import session from 'koa-session';
import redisStore from 'koa-redis';

import config from '~/server/config';
import { getRedisConfig } from '~/server/modules/redis';

export default function setupSessions(app: Koa): void {
  // eslint-disable-next-line no-param-reassign
  app.keys = [config.sessionSecret];
  app.use(
    session(
      {
        key: 'koa:sess',
        maxAge: 86400 * 1000 * 30,
        overwrite: true,
        httpOnly: true,
        signed: true,
        rolling: false,
        renew: true,
        store: redisStore(getRedisConfig()),
      },
      app,
    ),
  );
}
