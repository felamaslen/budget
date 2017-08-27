/**
 * Launch script for the server
 */

const config = require('./config')();

const serverApp = require('./server');

// listen to web requests
serverApp().then(server => {
    if (config.debug) {
        console.log(`App is listening on port ${server.port}!`);
    }
});

