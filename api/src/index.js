/**
 * Launch script for the server
 */

const dotenv = require('dotenv');
if (process.env.NODE_ENV === 'development' || process.env.DOTENV_INJECT === 'true') {
    dotenv.config();
}

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

