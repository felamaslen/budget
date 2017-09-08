const Database = require('../src/db');
const config = require('../src/config')();

function logger(message, key = 'MSG') {
    console.log(`[${key}@${new Date()}]`, message);
}

async function connectToDatabase() {
    const info = Database.parseConnectionURI(config.mysqlUri);

    const db = new Database.Connection(info);

    await db.connect();

    return db;
}

module.exports = {
    logger,
    connectToDatabase
};

