/**
 * Class and methods to access MySQL database
 */

const mysql = require('mysql');

const common = require('./common');
const config = require('./config')();

function parseConnectionURI(uri) {
    const matches = uri.match(/^mysql:\/\/(\w+):(\w+)@([\w-]+(\.[\w-]+)*)(:([0-9]+))?\/(\w+)$/);

    if (!matches) {
        return null;
    }

    const user = matches[1];
    const password = matches[2];
    const host = matches[3];
    const port = parseInt(matches[6], 10);
    const database = matches[7];

    return {
        user,
        password,
        host,
        port,
        database
    };
}

class ErrorDuplicateEntry extends common.ErrorBadRequest {
}

class ErrorOutOfRange extends common.ErrorBadRequest {
}

class ErrorDatabase extends Error {
}

// promise wrapper for the mysql library
class Connection {
    constructor(options) {
        this.conn = mysql.createConnection(Object.assign({}, options, {
            supportBigNumbers: true
        }));

        this.requireForceToEnd = false;
        this.debug = 0;
    }

    static handleError(reject, err) {
        const duplicateMatch = err.message.match(
            /^ER_DUP_ENTRY: .* for key '([\w\s]+)'$/
        );

        if (duplicateMatch) {
            return reject(new ErrorDuplicateEntry(duplicateMatch[1]));
        }

        const outOfRange = err.message.match(
            /^ER_WARN_DATA_OUT_OF_RANGE: .* for column '([\w\s]+)'/
        );

        if (outOfRange) {
            return reject(new ErrorOutOfRange(`${outOfRange[1]} out of range`));
        }

        if (config.debugSql) {
            console.log('SQL error:', err);
        }

        return reject(new ErrorDatabase(config.msg.errorServerDb));
    }

    wrapSimple(func, res) {
        return new Promise((resolve, reject) => {
            this.conn[func](err => {
                if (err) {
                    if (res) {
                        return res
                            .status(500)
                            .json({
                                error: true,
                                errorMessage: config.msg.errorServerDb
                            })
                            .end();
                    }

                    return Connection.handleError(reject, err);
                }

                return resolve(this);
            });
        });
    }
    connect() {
        return this.wrapSimple('connect', null);
    }
    end(res, force = false) {
        if (this.requireForceToEnd && !force) {
            return this;
        }

        return this.wrapSimple('end', res);
    }
    query(sql, ...args) {
        return new Promise((resolve, reject) => {
            this.conn.query(sql, args, (err, results) => {
                if (this.debug >= 2 || config.debugSql) {
                    const rawQuery = sql
                        .replace(/\?/g, () => mysql.escape(args.shift()))
                        .replace(/\s+/g, ' ')
                        .replace(/^\s+/, '')
                        .replace(/\s+$/, '');

                    console.log({ rawQuery });
                }

                if (err) {
                    if (this.debug > 0 || process.env.NODE_ENV === 'development') {
                        console.log('DB error:', err);
                    }

                    return Connection.handleError(reject, err);
                }

                return resolve(results);
            });
        });
    }
}

async function dbMiddleware(req, res, next) {
    const info = parseConnectionURI(config.mysqlUri);

    let db = null;
    try {
        db = new Connection(info);

        await db.connect();
    }
    catch (err) {
        // some error occurred connecting to the database
        return res
            .status(503)
            .json({
                error: true,
                errorMessage: 'Server database failure'
            })
            .end();
    }

    req.db = db;

    return next();
}

module.exports = {
    parseConnectionURI,
    ErrorDuplicateEntry,
    Connection,
    dbMiddleware
};

