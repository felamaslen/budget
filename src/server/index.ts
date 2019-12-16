import '@babel/polyfill';
import Koa from 'koa';
import http, { Server } from 'http';
import Router, { RouterContext } from 'koa-router';
import helmet from 'koa-helmet';
import bodyParser from 'koa-bodyparser';

import config from '~/server/config';
import { logger } from '~/server/modules/logger';
import { setupSockets } from '~/server/modules/socket';
import setupSessions from '~/server/modules/session';

import appRoute from '~/server/routes/app';
import authRoute from '~/server/routes/auth';

function healthRoute(): Router {
  const router = new Router();

  router.get('/health', (ctx: RouterContext) => {
    ctx.body = 'OK';
    ctx.status = 200;
  });

  return router;
}

function createServer(): Server {
  const app = new Koa();
  const server = http.createServer(app.callback());

  setupSockets(server);

  app.use(helmet());
  app.use(bodyParser());
  app.use(healthRoute().routes());

  setupSessions(app);
  app.use(authRoute().middleware());
  appRoute(app);

  return server;
}

function run(): void {
  const server = createServer();

  server.listen(config.port, () => {
    logger.info('Server listening on port %s', config.port);
  });
}

run();
