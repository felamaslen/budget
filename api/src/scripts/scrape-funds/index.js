import commandLineArgs from 'command-line-args';

import getConfig from '~api/config';
import getLogger from '~api/modules/logger';
import getDb from '~api/modules/db';
import { processScrape } from '~api/scripts/scrape-funds/process';

async function run() {
    const flags = commandLineArgs([
        { name: 'holdings', alias: 'h', type: Boolean },
        { name: 'prices', alias: 'p', type: Boolean }
    ]);

    const config = getConfig();

    const logger = getLogger();
    const db = getDb();

    const status = await processScrape(config, flags, db, logger);

    db.destroy();

    process.exit(status); // eslint-disable-line no-process-exit
}

run();
