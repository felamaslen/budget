/**
 * Class and methods to access PostgreSQL database
 */

const knex = require('knex');

function parseConnectionURI(uri = '') {
    const matches = uri.match(/^postgres:\/\/(\w+):(\w+)@([\w-]+(\.[\w-]+)*)(:([0-9]+))?\/(\w+)$/);

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

function initDb(config) {
    return knex({
        client: 'pg',
        connection: {
            ...parseConnectionURI(config.postgresUri),
            typeCast: (field, next) => {
                if (field.type === 'TINY' && field.length === 1) {
                    const value = field.string();
                    if (value) {
                        return value === '1';
                    }

                    return null;
                }

                return next();
            }
        }
    });
}

module.exports = initDb;
