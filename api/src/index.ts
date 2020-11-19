import { Server } from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import express from 'express';
import webLogger from 'morgan';
import passport from 'passport';
import serveStatic from 'serve-static';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import config from '~api/config';
import { healthRoutes } from '~api/health';
import { getStrategy } from '~api/modules/auth';
import { errorHandler } from '~api/modules/error-handling';
import { getIp } from '~api/modules/headers';
import logger from '~api/modules/logger';
import routes from '~api/routes';

const API_PREFIX = '/api/v4';

function setupDevServer(app: express.Express): void {
  /* eslint-disable */
  const conf = require('../../webpack.config');
  const compiler = require('webpack')(conf);

  app.use(require('connect-history-api-fallback')());
  app.use(
    require('webpack-dev-middleware')(compiler, {
      publicPath: '/',
      stats: {
        colors: true,
        modules: false,
        chunks: false,
        reasons: false,
      },
      hot: true,
      quiet: false,
    }),
  );

  app.use(
    require('webpack-hot-middleware')(compiler, {
      log: console.log, // eslint-disable-line no-console
    }),
  );
  /* eslint-enable */
}

function setupStaticViews(app: express.Express): void {
  app.set('views', path.join(__dirname, '../../web/src/templates'));
  app.set('view engine', 'ejs');
}

function setupWebApp(app: express.Express): void {
  const hot = process.env.SKIP_APP !== 'true' && process.env.NODE_ENV === 'development';
  if (hot) {
    setupDevServer(app);
  }

  setupStaticViews(app);

  const singlePageApp = (_: express.Request, res: express.Response): void => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.resolve(__dirname, '../../web/build/index.html'));
  };

  // web app static files
  app.use(
    '/',
    serveStatic(path.resolve(__dirname, '../../web/build'), {
      maxAge: 3600 * 24 * 100 * 1000,
    }),
  );

  app.get('/:pageName?', singlePageApp);
  app.get('/:pageName/*', singlePageApp);
}

function setupLogging(app: express.Express): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    app.use(webLogger('dev'));
  } else {
    webLogger.token('remote-addr', getIp);

    app.use(
      webLogger('common', {
        skip: (_: unknown, res: express.Response) => res.statusCode < 400,
        stream: process.stderr,
      }),
    );

    app.use(
      webLogger('common', {
        skip: (_: unknown, res: express.Response) => res.statusCode >= 400,
        stream: process.stdout,
      }),
    );
  }
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

function setupApi(app: express.Express, databaseName?: string): void {
  passport.use('jwt', getStrategy(databaseName));
  app.use(passport.initialize());
  app.use(healthRoutes(databaseName));
  app.use(API_PREFIX, routes(databaseName));
  setupApiDocs(app);
}

function setupErrorHandling(app: express.Express): void {
  app.use((_, res) => {
    res.status(404).send('File not found');
  });

  app.use(errorHandler);
}

export function run(port = config.app.port, databaseName?: string): Promise<Server> {
  const app = express();

  setupLogging(app);
  setupDataInput(app);
  setupApi(app, databaseName);
  setupWebApp(app);
  setupErrorHandling(app);

  return new Promise((resolve, reject) => {
    const server = app.listen(port, (err?: Error) => {
      if (err) {
        logger.error('Error starting server: %s', err.stack);
        reject(err);
      } else {
        logger.info('Server listening on port %s', port);
        resolve(server);
      }
    });
  });
}

if (!module.parent) {
  run();
}
