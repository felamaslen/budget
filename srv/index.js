/**
 * Launch script for the server
 */

require('dotenv').config();
const config = require('./config');

const serverApp = require('./server');

// listen to web requests
serverApp().then(server => {
  if (config.debug) {
    console.log(`App is listening on port ${server.port}!`);
  }
});

