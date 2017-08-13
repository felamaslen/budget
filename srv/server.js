/**
 * Express API and web server
 */

require('dotenv').config();
const config = require('./config');

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const version = require('../package.json').version;
const api = require('./api.js');
const MongoClient = require('mongodb').MongoClient;

function connectToDatabase() {
  return new Promise(resolve => {
    if (config.debug) {
      console.log('Connecting to database...');
    }
    MongoClient.connect(config.mongoUri, (err, db) => {
      if (config.debug) {
        console.log('Connected!');
      }
      if (err) {
        throw new Error('Couldn\'t connect to database');
      }
      resolve(db);
    });
  });
}

function serverApp() {
  return new Promise(resolve => {
    connectToDatabase().then(db => {
      // initiate express web server
      const app = express();

      if (config.debug) {
        app.use(logger('dev'));
      }

      // set up template engine
      app.set('views', path.join(__dirname, 'templates'));
      app.set('view engine', 'ejs');

      // required for POST
      app.use(bodyParser.urlencoded({ extended: true }));

      app.use(express.static(path.join(__dirname, '../web/build')));

      app.use('/api', api(db));

      // load home (app) page by default
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

      resolve({ port, app, db });
    });
  });
}

module.exports = serverApp;

