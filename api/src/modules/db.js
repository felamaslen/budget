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

async function initDb(config, logger, migrate = true) {
    const db = knex({
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

    if (migrate) {
        await db.migrate.latest();

        logger.verbose('Database migrations complete');
    }

    return db;
}

module.exports = initDb;

