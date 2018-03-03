/**
 * Express API and web server
 */

/* eslint-disable global-require */

const express = require('express');
const bodyParser = require('body-parser');
const CacheControl = require('express-cache-control');
const path = require('path');
const webLogger = require('morgan');
const swaggerUiDist = require('swagger-ui-dist');
const swaggerJSDoc = require('swagger-jsdoc');

const { version } = require('../../package.json');
const getConfig = require('./config');
const initDb = require('./modules/db');
const routes = require('./routes');

function getVersion() {
    return version.substring(0, version.indexOf('-'));
}

function setupLogging(app, config) {
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

function setupApiDocs(app, config) {
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

function setupApi(app, config, db) {
    app.use('/api/v3', routes(config, db));

    setupApiDocs(app, config);
}

function setupDevServer(app) {
    const conf = require('../../webpack.config')();
    const compiler = require('webpack')(conf);

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
    if (process.env.SKIP_APP !== 'true' && process.env.NODE_ENV === 'development') {
        setupDevServer(app);
    }

    // set up views engine
    setupStaticViews(app);

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

async function run() {
    try {
        const config = getConfig();
        const db = await initDb(config);
        const app = express();
        const port = process.env.PORT || 3000;

        setupLogging(app, config);
        setupDataInput(app);
        setupApi(app, config, db);
        setupWebApp(app);
        setupErorHandling(app);

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    }
    catch (err) {
        console.error('Server did not start:', err.message);
    }
}

module.exports = { run };

