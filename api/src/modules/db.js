/**
 * Class and methods to access MySQL database
 */

const knex = require('knex');

function parseConnectionURI(uri = '') {
    const matches = uri.match(/^mysql:\/\/(\w+):(\w+)@([\w-]+(\.[\w-]+)*)(:([0-9]+))?\/(\w+)$/);

    if (!matches) {
        throw new Error('invalid database string');
    }

    const [, user, password, host, , , port, database] = matches;

    return {
        user,
        password,
        host,
        port,
        database
    };
}

async function initDb(config) {
    const db = knex({
        client: 'mysql2',
        connection: parseConnectionURI(config.mysqlUri)
    });

    await db.migrate.latest();

    console.log('Database migrations complete');

    return db;
}

module.exports = initDb;

