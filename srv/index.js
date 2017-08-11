/**
 * Launch script for the server
 */

require('dotenv').config();
const config = require('./config');

const serverApp = require('./server');

// listen to web requests
const port = process.env.PORT || 3000;
serverApp().then(app => {
  app.listen(port);
  if (config.debug) {
    console.log(`App is listening on port ${port}!`);
  }
});

