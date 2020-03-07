import { Server } from 'http';
import path from 'path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import config from '~api/config';
import logger from '~api/modules/logger';

/*
import '@babel/polyfill';

import express from 'express';
import bodyParser from 'body-parser';
import serveStatic from 'serve-static';
import path from 'path';
import webLogger from 'morgan';
import passport from 'passport';

import { version } from '../../package.json';
import config from '~api/config';
import logger from '~api/modules/logger';
import { getStrategy } from '~api/modules/auth';
import { errorHandler } from '~api/modules/error-handling';
import routes from '~api/routes';

const API_PREFIX = '/api/v4';

const getHeader = (req: express.Request, key: string): string => {
    const header = req.headers[key];
    if (Array.isArray(header)) {
        return header[0] || '';
    }

    return header || '';
};

function setupLogging(app: express.Express): void {
    if (config.debug) {
        app.use(webLogger('dev'));
    } else {
        webLogger.token(
            'remote-addr',
            req =>
                getHeader(req, 'x-real-ip') ||
                getHeader(req, 'x-forwarded-for') ||
                req.connection.remoteAddress ||
                '',
        );

        app.use(
            webLogger('common', {
                skip: (_, res) => res.statusCode < 400,
                stream: process.stderr,
            }),
        );

        app.use(
            webLogger('common', {
                skip: (_, res) => res.statusCode >= 400,
                stream: process.stdout,
            }),
        );
    }
}

function setupStaticViews(app: express.Express): void {
    // set up template engine
    app.set('views', path.join(__dirname, '../../web/src/templates'));
    app.set('view engine', 'ejs');
}

function setupDataInput(app: express.Express): void {
    // accept REST data parameters
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
}
*/

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

function setupApi(app: express.Express): void {
  // passport.use('jwt', getStrategy());

  // app.use(passport.initialize());

  app.get('/health', (_, res) => {
    res.json({ ok: true });
  });

  // app.use(API_PREFIX, routes());

  setupApiDocs(app);
}

/*
function setupDevServer(app: express.Express): void {
    // eslint-disable global-require, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
    const conf = require('../../webpack.config');
    const compiler = require('webpack')(conf);

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
    // eslint-enable global-require, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
}

function setupWebApp(app: express.Express): void {
    const hot = process.env.SKIP_APP !== 'true' && process.env.NODE_ENV === 'development';
    if (hot) {
        setupDevServer(app);
    }

    setupStaticViews(app);

    const singlePageApp = (_: express.Request, res: express.Response): void => {
        const pieTolerance = process.env.PIE_TOLERANCE || 0.075;

        res.setHeader('Cache-Control', 'no-cache');

        res.render('index', {
            version,
            hot,
            pieTolerance,
        });
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

function setupErrorHandling(app: express.Express): void {
    app.use(errorHandler());

    app.use((_, res) => {
        res.status(404).send('File not found');
    });
}

function run(): void {
    try {
        const app = express();
        const port = process.env.PORT || 3000;

        setupLogging(app);
        setupDataInput(app);
        setupWebApp(app);
        setupErrorHandling(app);

        app.listen(port, () => {
            logger.info('Server listening on port', port);
        });
    } catch (err) {
        logger.error('Server did not start:', err.stack);
    }
}
*/

export function run(port: number = config.app.port): Promise<Server> {
  const app = express();

  setupApi(app);

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
