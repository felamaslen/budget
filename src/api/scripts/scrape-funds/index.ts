import { processScrape } from './process';
import { CLIOptions } from './types';

import { getPool, withSlonik } from '~api/modules/db';
import logger from '~api/modules/logger';

export const run = withSlonik<void>(async (db) => {
  const flags: CLIOptions = {
    holdings: process.argv.includes('--holdings'),
    prices: process.argv.includes('--prices'),
  };

  await processScrape(db, flags);
});

if (require.main === module) {
  run()
    .then(() => {
      getPool().end();
      process.exit();
    })
    .catch((err: Error) => {
      logger.error(err.stack);
      process.exit(1);
    });
}
