import 'tsconfig-paths/register';

import db from './knex';
import { getPool } from '~api/modules/db';

export default async (): Promise<void> => {
  await db.destroy();
  await getPool().end();
};
