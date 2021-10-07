/* eslint-disable @typescript-eslint/no-var-requires, global-require, import/no-extraneous-dependencies, no-console */

import http, { Server } from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { Request } from 'express';
import helmet from 'helmet';
import webLogger from 'morgan';
import favicon from 'serve-favicon';
import serveStatic from 'serve-static';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import config from '~api/config';
import { healthRoutes } from '~api/health';
import { setupAuth } from '~api/modules/auth';
import { errorHandler } from '~api/modules/error-handling';
import { setupGraphQL } from '~api/modules/graphql';
import { getIp } from '~api/modules/headers';
import logger from '~api/modules/logger';
import { makeSinglePageApp } from '~api/modules/ssr';
import routes from '~api/routes';

const webLoggerStream = {
  write: (text: string): void => {
    logger.info(text);
  },
};

const webLoggerStreamError = {
  write: (text: string): void => {
    logger.error(text);
  },
};

const API_PREFIX = '/api/v4';

const hot = process.env.SKIP_APP !== 'true' && process.env.NODE_ENV === 'development';

function setupProdAssets(app: express.Express): void {
  app.use(
    '/',
    serveStatic(path.resolve(__dirname, '../../static'), {
      maxAge: 3600 * 24 * 100 * 1000,
    }),
  );
}

function setupDevAssets(app: express.Express): void {
  const conf = require('../../webpack.config');
  const compiler = require('webpack')(conf);

  app.use(
    require('webpack-dev-middleware')(compiler, {
      publicPath: '/',
      serverSideRender: true,
      index: false,
    }),
  );

  app.use(
    require('webpack-hot-middleware')(compiler, {
      log: console.log,
    }),
  );
}

const singlePageAppRoutes: string[] = [
  '/',
  '/buckets',
  '/net-worth',
  '/net-worth/*',
  '/planning',
  '/planning/*',
  '/analysis/:groupBy?/:period?/:page?',
  '/funds',
  '/income',
  '/bills',
  '/food',
  '/general',
  '/holiday',
  '/social',
];

function setupWebApp(app: express.Express): void {
  app.set('views', path.join(__dirname, '../client/templates'));
  app.set('view engine', 'ejs');
  app.locals.delimiter = '?'; // eslint-disable-line no-param-reassign

  app.use(favicon(path.resolve(__dirname, '../client/images/favicon.png')));

  const singlePageApp = makeSinglePageApp(hot);

  singlePageAppRoutes.forEach((route) => {
    app.get(route, singlePageApp);
  });

  app.get('/index.html', makeSinglePageApp(false, true));
}

function setupLogging(app: express.Express): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  webLogger.token('remote-addr', getIp);

  app.use(
    webLogger('common', {
      skip: (_: unknown, res: express.Response) => res.statusCode < 400,
      stream: webLoggerStreamError,
    }),
  );

  app.use(
    webLogger('common', {
      skip: (req: Request, res: express.Response) =>
        req.url.startsWith('/liveness') ||
        req.url.startsWith('/readiness') ||
        res.statusCode >= 400,
      stream: webLoggerStream,
    }),
  );
}

function setupDataInput(app: express.Express): void {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
}

function setupApiDocs(app: express.Express): void {
  app.use(
    '/docs',
    swaggerUi.serve,
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const swaggerDocument = YAML.load(path.resolve(__dirname, '../../docs/api.yml'));

      swaggerUi.setup(swaggerDocument)(req, res, next);
    },
  );
}

function setupRestApi(app: express.Express): void {
  app.use(healthRoutes());
  app.use(API_PREFIX, routes());
  setupApiDocs(app);
}

function setupErrorHandling(app: express.Express): void {
  app.use((_, res) => {
    res.status(404).send('File not found');
  });

  app.use(errorHandler);
}

function setupMiddleware(app: express.Express): void {
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'development'
          ? false
          : {
              directives: {
                defaultSrc: [`'self'`],
                connectSrc: [`'self'`, `https://api.exchangeratesapi.io`],
                imgSrc: [`'self'`, 'data:'],
                styleSrc: [`'self'`, `'unsafe-inline'`, `https://www.gstatic.com`],
                scriptSrc: [`'self'`, `'unsafe-inline'`, `https://www.gstatic.com`],
              },
            },
    }),
  );
  app.get('/robots.txt', (_, res) => {
    res.send('User-agent: *\nDisallow: /\n');
  });
  app.use(compression());
  app.use(cookieParser(config.user.tokenSecret));
}

export async function run(port = config.app.port): Promise<Server> {
  const app = express();
  const server = http.createServer(app);

  setupLogging(app);
  setupDataInput(app);

  setupMiddleware(app);
  setupAuth(app);
  setupRestApi(app);
  const onListen = await setupGraphQL(app, server);

  if (hot) {
    setupDevAssets(app);
  }

  setupWebApp(app);

  if (!hot) {
    setupProdAssets(app);
  }

  setupErrorHandling(app);

  return new Promise((resolve, reject) => {
    server.listen(port, (err?: Error) => {
      if (err) {
        logger.error('Error starting server: %s', err.stack);
        reject(err);
      } else {
        onListen();
        logger.info('Server listening on port %s', port);

        resolve(server);
      }
    });
  });
}

if (require.main === module) {
  run();
}
