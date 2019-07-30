/**
 * Express API and web server
 */

/* eslint-disable global-require */

import express from 'express';
import bodyParser from 'body-parser';
import serveStatic from 'serve-static';
import path from 'path';
import webLogger from 'morgan';
import passport from 'passport';
import swaggerUiDist from 'swagger-ui-dist';
import swaggerJSDoc from 'swagger-jsdoc';

import { version } from '../../package.json';
import config from '~api/config';
import db from '~api/modules/db';
import getLogger from '~api/modules/logger';
import { getStrategy } from '~api/modules/auth';
import { errorHandler } from '~api/modules/error-handling';
import routes from '~api/routes';

const API_PREFIX = '/api/v4';

function getVersion() {
    return version.substring(0, version.indexOf('-'));
}

function setupLogging(app) {
    if (config.debug) {
        app.use(webLogger('dev'));
    }
    else {
        webLogger.token('remote-addr', req =>
            req.headers['x-real-ip'] ||
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress
        );

        app.use(webLogger('common', {
            skip: (req, res) => res.statusCode < 400,
            stream: process.stderr
        }));

        app.use(webLogger('common', {
            skip: (req, res) => res.statusCode >= 400,
            stream: process.stdout
        }));
    }
}

function setupStaticViews(app) {
    // set up template engine
    app.set('views', path.join(__dirname, '../../web/src/templates'));
    app.set('view engine', 'ejs');
}

function setupDataInput(app) {
    // accept REST data parameters
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
}

function setupApiDocs(app) {
    // API docs
    const swaggerDefinition = {
        info: {
            title: 'Budget API',
            version: getVersion(),
            description: 'Personal finance manager API'
        },
        host: config.webUrl.substring(config.webUrl.indexOf('//') + 2),
        schemes: [config.webUrl.substring(0, config.webUrl.indexOf(':'))],
        basePath: API_PREFIX
    };

    const swaggerOptions = {
        swaggerDefinition,
        apis: [
            path.join(__dirname, './routes/**/index.js')
        ]
    };

    const swaggerSpec = swaggerJSDoc(swaggerOptions);

    app.get('/docs/spec.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    const swaggerUiAssetPath = swaggerUiDist.getAbsoluteFSPath();

    app.get('/docs/api', (req, res) => {
        return res.sendFile(path.join(__dirname, '../../docs/api/index.html'));
    });
    app.use('/docs/', express.static(swaggerUiAssetPath));
}

function setupApi(app, logger) {
    passport.use('jwt', getStrategy(config, db, logger));

    app.use(passport.initialize());

    app.get('/health', (req, res) => {
        res.send('ok');
    });

    app.use(API_PREFIX, routes(config, db, logger));

    setupApiDocs(app);
}

function setupDevServer(app) {
    const conf = require('../../webpack.config');
    const compiler = require('webpack')(conf);

    app.use(require('webpack-dev-middleware')(compiler, {
        publicPath: '/',
        stats: {
            colors: true,
            modules: false,
            chunks: false,
            reasons: false
        },
        hot: true,
        quiet: false
    }));

    app.use(require('webpack-hot-middleware')(compiler, {
        log: console.log
    }));
}

function setupWebApp(app) {
    const hot = process.env.SKIP_APP !== 'true' && process.env.NODE_ENV === 'development';
    if (hot) {
        setupDevServer(app);
    }

    setupStaticViews(app);

    const singlePageApp = (req, res) => {
        const pieTolerance = process.env.PIE_TOLERANCE || 0.075;

        res.setHeader('Cache-Control', 'no-cache');

        res.render('index', {
            version,
            hot,
            pieTolerance
        });
    };

    // web app static files
    app.use('/', serveStatic(path.resolve(__dirname, '../../web/build'), {
        maxAge: 3600 * 24 * 100 * 1000
    }));

    app.get('/:pageName?', singlePageApp);
    app.get('/:pageName/*', singlePageApp);
}

function setupErrorHandling(app, logger) {
    app.use(errorHandler(logger));

    app.use((req, res) => {
        res.status(404).send('File not found');
    });
}

function run() {
    const logger = getLogger();

    try {
        const app = express();
        const port = process.env.PORT || 3000;

        setupLogging(app);
        setupDataInput(app);
        setupApi(app, logger);
        setupWebApp(app);
        setupErrorHandling(app, logger);

        app.listen(port, () => {
            logger.info('Server listening on port', port);
        });
    } catch (err) {
        logger.error('Server did not start:', err.stack);
    }
}

run();
