/**
 * Script to scrape fund prices from broker
 */

const commandLineArgs = require('command-line-args');

const getConfig = require('../../src/config');
const getLogger = require('../../src/modules/logger');
const initDb = require('../../src/modules/db');
const { processScrape } = require('./process');

async function run() {
    const flags = commandLineArgs([
        { name: 'holdings', alias: 'h', type: Boolean },
        { name: 'prices', alias: 'p', type: Boolean }
    ]);

    const config = getConfig();

    const logger = getLogger();
    const db = await initDb(config, logger, false);

    const status = await processScrape(config, flags, db, logger);

    db.destroy();

    process.exit(status); // eslint-disable-line no-process-exit
}

run();

