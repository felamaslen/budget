import db, { pool } from '../api/src/modules/db';

export default async (): Promise<void> => {
  await db.destroy();
  await pool.end();
};
