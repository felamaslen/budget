import { processScrape } from './process';
import { CLIOptions } from './types';

import { pool, withSlonik } from '~api/modules/db';
import logger from '~api/modules/logger';

const runWithDb = withSlonik<number>(async (db) => {
  const flags: CLIOptions = {
    holdings: process.argv.includes('--holdings'),
    prices: process.argv.includes('--prices'),
  };

  let status = 0;

  try {
    await processScrape(db, flags);
  } catch (err) {
    logger.error(err.stack);
    status = 1;
  }

  return status;
});

export async function run(): Promise<void> {
  const status = await runWithDb();

  if (!module.parent) {
    pool.end();
    process.exit(status);
  }
}

if (!module.parent) {
  run();
}
