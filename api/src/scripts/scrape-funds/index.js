import '@babel/polyfill';

import commandLineArgs from 'command-line-args';

import config from '~api/config';
import getLogger from '~api/modules/logger';
import db from '~api/modules/db';
import { processScrape } from '~api/scripts/scrape-funds/process';

async function run() {
    const flags = commandLineArgs([
        { name: 'holdings', alias: 'h', type: Boolean },
        { name: 'prices', alias: 'p', type: Boolean },
    ]);

    const logger = getLogger();

    const status = await processScrape(config, flags, db, logger);

    db.destroy();

    process.exit(status); // eslint-disable-line no-process-exit
}

run();
