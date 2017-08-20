/**
 * Express API and web server
 */

const config = require('./config')();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');

const version = require('../package.json').version;
const api = require('./api.js');

function connectToDatabase() {
    // TODO: connect to a MySQL database
    return Promise.resolve(null);
}

async function serverApp() {
    // initiate express web server
    const app = express();

    if (config.debug) {
        app.use(logger('dev'));
    }

    const db = await connectToDatabase();

    // set up template engine
    app.set('views', path.join(__dirname, 'templates'));
    app.set('view engine', 'ejs');

    // accept REST data parameters
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // API docs
    app.use('/docs/api', express.static(path.join(__dirname, '../docs/api')));

    // API
    app.use('/api', api(db)); // TODO

    // web app static files
    app.use('/', express.static(path.join(__dirname, '../web/build')));

    // index template
    app.get('/', (req, res) => {
        const pieTolerance = process.env.PIE_TOLERANCE || 0.075;
        res.render('index', {
            version,
            pieTolerance
        });
    });

    // error handling
    app.use((req, res) => {
        res.status(404).send('File not found');
    });

    const port = process.env.PORT || 3000;
    app.listen(port);

    return { port, app, db };
}

module.exports = serverApp;

