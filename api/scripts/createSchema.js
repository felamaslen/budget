/**
 * Script to create an empty database schema for the API
 */

require('dotenv').config();
const config = require('../src/config')();
const { logger } = require('./common');

const Database = require('../src/db');
const { userPinHash } = require('../src/routes/user');

async function connectToDatabase() {
    const info = Database.parseConnectionURI(config.mysqlUri);
    const db = new Database.Connection(info);

    await db.connect();

    return db;
}

function generateRandomPin() {
    return 1000 + Math.floor(Math.random() * 8999);
}

async function createSuperUser(db) {
    const pin = generateRandomPin();
    const hash = userPinHash(pin);

    logger(`Creating super user (root:${pin})`);

    await db.query(`
    INSERT INTO users (user, api_key)
    VALUES(?, ?)
    `, 'root', hash);
}

async function createTableUsers(db) {
    logger('Creating users table');
    await db.query(`
    CREATE TABLE users (
        uid int(11) NOT NULL AUTO_INCREMENT,
        user VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
        api_key VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
        PRIMARY KEY (uid),
        UNIQUE KEY api_key (api_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);

    await createSuperUser(db);

    logger('Creating ip_login_req table');
    await db.query(`
    CREATE TABLE ip_login_req (
        ip varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        time bigint(20) NOT NULL,
        count int(11) NOT NULL DEFAULT '0',
        UNIQUE KEY \`ip\` (ip)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);
}

async function createTableBalance(db) {
    logger('Creating balance table');
    await db.query(`
    CREATE TABLE balance (
        id int(11) NOT NULL AUTO_INCREMENT,
        uid int(11) NOT NULL,
        year smallint(6) NOT NULL,
        month tinyint(4) NOT NULL,
        balance bigint(20) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY \`Only one balance item per year/month\` (uid,year,month),
        FOREIGN KEY (uid) REFERENCES users(uid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);
}

async function createTableFunds(db) {
    logger('Creating funds table');
    await db.query(`
    CREATE TABLE funds (
        id int(11) NOT NULL AUTO_INCREMENT,
        uid int(11) NOT NULL,
        year smallint(6) NOT NULL,
        month tinyint(4) NOT NULL,
        date tinyint(4) NOT NULL,
        item varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        transactions text COLLATE utf8_unicode_ci NOT NULL,
        cost int(11) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY \`Unique fund per user\` (uid,item),
        FOREIGN KEY (uid) REFERENCES users(uid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);

    logger('Creating fund_hash table');
    await db.query(`
    CREATE TABLE fund_hash (
        fid int(11) NOT NULL AUTO_INCREMENT,
        broker varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        hash varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        PRIMARY KEY (fid),
        UNIQUE KEY \`fund\` (broker,hash)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);

    logger('Creating fund_cache_time table');
    await db.query(`
    CREATE TABLE fund_cache_time (
        cid int(11) NOT NULL AUTO_INCREMENT,
        time bigint(20) NOT NULL,
        done tinyint(4) NOT NULL,
        PRIMARY KEY (cid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);

    logger('Creating fund_cache table');
    await db.query(`
    CREATE TABLE fund_cache (
        id int(11) NOT NULL AUTO_INCREMENT,
        cid int(11) NOT NULL,
        fid int(11) NOT NULL,
        price float DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY \`fund\` (cid,fid),
        FOREIGN KEY (cid) REFERENCES fund_cache_time(cid),
        FOREIGN KEY (fid) REFERENCES fund_hash(fid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);

    logger('Creating stocks table');
    await db.query(`
    CREATE TABLE stocks (
        id int(11) NOT NULL AUTO_INCREMENT,
        uid int(11) NOT NULL,
        name varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        code varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
        weight double DEFAULT NULL,
        subweight double NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (uid) REFERENCES users(uid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);
}

async function createTableIncome(db) {
    logger('Creating income table');

    await db.query(`
    CREATE TABLE income (
        id int(11) NOT NULL AUTO_INCREMENT,
        uid int(11) NOT NULL,
        year smallint(6) NOT NULL,
        month tinyint(4) NOT NULL,
        date tinyint(4) NOT NULL,
        item varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        cost int(11) NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (uid) REFERENCES users(uid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);
}

async function createTableBills(db) {
    logger('Creating bills table');

    await db.query(`
    CREATE TABLE bills (
        id int(11) NOT NULL AUTO_INCREMENT,
        uid int(11) NOT NULL,
        year smallint(6) NOT NULL,
        month tinyint(4) NOT NULL,
        date tinyint(4) NOT NULL,
        item varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        cost int(11) NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (uid) REFERENCES users(uid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);
}

async function createTableFood(db) {
    logger('Creating food table');

    await db.query(`
    CREATE TABLE food (
        id int(11) NOT NULL AUTO_INCREMENT,
        uid int(11) NOT NULL,
        year smallint(6) NOT NULL,
        month tinyint(4) NOT NULL,
        date tinyint(4) NOT NULL,
        item varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        category varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        cost int(11) NOT NULL,
        shop varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (uid) REFERENCES users(uid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);
}

async function createTableGeneral(db) {
    logger('Creating general table');

    await db.query(`
    CREATE TABLE general (
        id int(11) NOT NULL AUTO_INCREMENT,
        uid int(11) NOT NULL,
        year smallint(6) NOT NULL,
        month tinyint(4) NOT NULL,
        date tinyint(4) NOT NULL,
        item varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        category varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        cost int(11) NOT NULL,
        shop varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (uid) REFERENCES users(uid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);
}

async function createTableSocial(db) {
    logger('Creating social table');

    await db.query(`
    CREATE TABLE social (
        id int(11) NOT NULL AUTO_INCREMENT,
        uid int(11) NOT NULL,
        year smallint(6) NOT NULL,
        month tinyint(4) NOT NULL,
        date tinyint(4) NOT NULL,
        item varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        society varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        cost int(11) NOT NULL,
        shop varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (uid) REFERENCES users(uid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);
}

async function createTableHoliday(db) {
    logger('Creating holiday table');

    await db.query(`
    CREATE TABLE holiday (
        id int(11) NOT NULL AUTO_INCREMENT,
        uid int(11) NOT NULL,
        year smallint(6) NOT NULL,
        month tinyint(4) NOT NULL,
        date tinyint(4) NOT NULL,
        item varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        holiday varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        cost int(11) NOT NULL,
        shop varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (uid) REFERENCES users(uid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);
}

async function dropTables(db) {
    logger('Dropping old tables');

    const tables = [
        'balance',
        'funds',
        'fund_cache',
        'fund_cache_time',
        'fund_hash',
        'stocks',
        'income',
        'bills',
        'food',
        'general',
        'social',
        'holiday',
        'users',
        'ip_login_req'
    ];

    const queries = tables.map(table => db.query(`DROP TABLE IF EXISTS ${table}`));

    await Promise.all(queries);
}

async function createSchema(db) {
    await dropTables(db);

    await createTableUsers(db);

    await createTableBalance(db);

    await createTableFunds(db);

    await createTableIncome(db);
    await createTableBills(db);
    await createTableFood(db);
    await createTableGeneral(db);
    await createTableSocial(db);
    await createTableHoliday(db);
}

async function run() {
    logger('Running database install script...');

    let db = null;
    try {
        db = await connectToDatabase();
        db.debug = 1;
    }
    catch (err) {
        logger('Couldn\'t connect to the database!', 'FATAL');

        return;
    }

    try {
        await createSchema(db);
    }
    catch (err) {
        logger(`An error occurred: ${err}`, 'ERROR');
    }

    await db.end();
}

run();

