import '@babel/polyfill';
import path from 'path';
import Koa from 'koa';
import Router from 'koa-router';
import helmet from 'koa-helmet';

import config from '~/server/config';
import { logger } from '~/server/modules/logger';

import appRoute from '~/server/routes/app';

function healthRoute(): Router {
  const router = new Router();

  router.get('/health', (ctx: any) => {
    ctx.body = 'OK';
    ctx.status = 200;
  });

  return router;
}

function createServer(): Koa {
  const app = new Koa();

  app.use(helmet());
  app.use(healthRoute().routes());
  appRoute(app);

  return app;
}

function run(): void {
  const server = createServer();

  server.listen(config.port, () => {
    logger.info('Server listening on port %s', config.port);
  });
}

run();
