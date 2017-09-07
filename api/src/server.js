/**
 * Express API and web server
 */

const config = require('./config')();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const swaggerUiDist = require('swagger-ui-dist');
const swaggerJSDoc = require('swagger-jsdoc');

const version = require('../../package.json').version;
const api = require('./api');

function setupLogging(app) {
    if (config.debug) {
        app.use(logger('dev'));
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
            version: '3.0.0',
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

    app.get('/docs/api/spec.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    const swaggerUiAssetPath = swaggerUiDist.getAbsoluteFSPath();

    app.get('/docs/api', (req, res) => {
        return res.sendFile(path.join(__dirname, '../../docs/api/index.html'));
    });
    app.get('/docs/api/favicon.png', (req, res) => {
        return res.sendFile(path.join(__dirname, '../../docs/api/index.html'));
    });
    app.use('/docs/api/', express.static(swaggerUiAssetPath));
}

function setupApi(app) {
    // API
    const apiRouter = new express.Router();
    app.use('/api/v3', api(apiRouter));

    setupApiDocs(app);
}

function setupWebApp(app) {
    // set up views engine
    setupStaticViews(app);

    // web app static files
    app.use('/', express.static(path.join(__dirname, '../../web/build')));

    // index template
    app.get('/', (req, res) => {
        const pieTolerance = process.env.PIE_TOLERANCE || 0.075;
        res.render('index', {
            version,
            pieTolerance
        });
    });
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

async function serverApp() {
    // initiate express web server
    const app = express();
    const port = process.env.PORT || 3000;

    setupLogging(app);
    setupDataInput(app);
    setupApi(app);
    setupWebApp(app);
    setupErorHandling(app);

    const server = await listen(app, port);

    return server;
}

module.exports = serverApp;

