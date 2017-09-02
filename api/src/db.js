/**
 * Class and methods to access MySQL database
 */

const mysql = require('mysql');

const config = require('./config')();

function parseConnectionURI(uri) {
    const matches = uri.match(/^mysql:\/\/(\w+):(\w+)@(\w+(\.\w+)*)(:([0-9]+))?\/(\w+)$/);

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

// promise wrapper for the mysql library
class Connection {
    constructor(options) {
        this.conn = mysql.createConnection(Object.assign({}, options, {
            supportBigNumbers: true
        }));
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

                    return reject(err);
                }

                return resolve(this);
            });
        });
    }
    connect(res) {
        return this.wrapSimple('connect', res);
    }
    end(res) {
        return this.wrapSimple('end', res);
    }
    query(sql, ...args) {
        return new Promise((resolve, reject) => {
            this.conn.query(sql, args, (err, results) => {
                if (err) {
                    return reject(err);
                }

                return resolve(results);
            });
        });
    }
}

async function getConnection(res) {
    const info = parseConnectionURI(config.mysqlUri);

    const db = new Connection(info);

    await db.connect(res);

    return db;
}

module.exports = {
    parseConnectionURI,
    Connection,
    getConnection
};

