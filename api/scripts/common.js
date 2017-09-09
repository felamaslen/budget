const colors = require('colors');
const dateformat = require('dateformat');

const Database = require('../src/db');
const config = require('../src/config')();

function formatNow() {
    const now = new Date();

    return dateformat(now, 'isoDateTime');
}

function logger(message, key = 'MSG') {
    let pre = `[${key}@${formatNow()}]`;
    let post = message;

    if (key === 'FATAL') {
        pre = colors.red.underline(pre);
    }
    else if (key === 'ERROR') {
        pre = colors.red(pre);
        post = colors.red(post);
    }
    else if (key === 'WARN') {
        pre = colors.yellow(pre);
        post = colors.yellow(post);
    }
    else if (key === 'MSG') {
        pre = colors.grey(pre);
    }
    else if (key === 'DEBUG') {
        pre = colors.cyan(pre);
        post = colors.cyan(post);
    }
    else if (key === 'SUCCESS') {
        pre = colors.green(pre);
    }

    console.log(pre, post);
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

