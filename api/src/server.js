/**
 * Express API and web server
 */

/* eslint-disable global-require */

const config = require('./config')();

const express = require('express');
const bodyParser = require('body-parser');
const CacheControl = require('express-cache-control');
const path = require('path');
const logger = require('morgan');
const swaggerUiDist = require('swagger-ui-dist');
const swaggerJSDoc = require('swagger-jsdoc');
const webpack = require('webpack');
const webpackConfig = require('../../webpack.config');

const version = require('../../package.json').version;
const api = require('./api');
const alphaRedirectMiddleware = require('./alphaRedirectMiddleware');

function getVersion() {
    return version.substring(0, version.indexOf('-'));
}

function setupLogging(app) {
    if (config.debug) {
        app.use(logger('dev'));
    }
    else {
        logger.token('remote-addr', req => req.headers['x-real-ip'] ||
            req.headers['x-forwarded-for'] || req.connection.remoteAddress);

        app.use(logger('common', {
            skip: (req, res) => res.statusCode < 400,
            stream: process.stderr
        }));

        app.use(logger('common', {
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
        basePath: '/api/v3'
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

function setupApi(app) {
    // API
    app.use(alphaRedirectMiddleware.handler);

    const apiRouter = new express.Router();
    app.use('/api/v3', api(apiRouter));

    setupApiDocs(app);
}

function setupDevServer(app) {
    const conf = webpackConfig();
    const compiler = webpack(conf);

    app.use(require('webpack-dev-middleware')(compiler, {
        publicPath: conf.output.publicPath,
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
    // set up views engine
    setupStaticViews(app);

    if (process.env.NODE_ENV === 'development') {
        setupDevServer(app);
    }

    // index template
    app.get('/:pageName?', (req, res) => {
        const pieTolerance = process.env.PIE_TOLERANCE || 0.075;
        res.render('index', {
            version,
            development: process.env.NODE_ENV === 'development',
            pieTolerance
        });
    });

    // web app static files
    const cache = new CacheControl().middleware;
    app.use('/', cache('days', 100), express.static(path.join(__dirname, '../../web/build')));
}

function setupErorHandling(app) {
    // error handling
    app.use((req, res) => {
        res.status(404).send('File not found');
    });
}

function listen(app, port) {
    return new Promise((resolve, reject) => {
        app.listen(port, err => {
            if (err) {
                return reject(err);
            }

            return resolve({ app, port });
        });
    });
}

function serverApp() {
    // initiate express web server
    const app = express();
    const port = process.env.PORT || 3000;

    setupLogging(app);
    setupDataInput(app);
    setupApi(app);
    setupWebApp(app);
    setupErorHandling(app);

    return listen(app, port);
}

module.exports = serverApp;

