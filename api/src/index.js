/**
 * Launch script for the server
 */

require('dotenv').config();
const serverApp = require('./server');

async function main() {
    try {
        const server = await serverApp();

        console.log(`App is listening on port ${server.port}`);
    }
    catch (err) {
        console.log('Server didn\'t start:', err.toString());
        console.log(err.stack);
    }
}

main();

