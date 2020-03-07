import db from '~api/modules/db';
import logger from '~api/modules/logger';
import { CLIOptions } from './types';
import { processScrape } from '~api/scripts/scrape-funds/process';

export async function run(): Promise<void> {
  const flags: CLIOptions = {
    holdings: process.argv.includes('--holdings'),
    prices: process.argv.includes('--prices'),
  };

  let status = 0;

  try {
    await processScrape(flags);
  } catch (err) {
    logger.error(err.stack);

    status = 1;
  }

  if (!module.parent) {
    db.destroy();

    process.exit(status);
  }
}

if (!module.parent) {
  run();
}
