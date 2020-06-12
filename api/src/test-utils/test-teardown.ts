import 'tsconfig-paths/register';

import db from './knex';
import { pool } from '~api/modules/db';

export default async (): Promise<void> => {
  await db.destroy();
  await pool.end();
};
