import db, { pool } from './modules/db';

export default async (): Promise<void> => {
  await db.destroy();
  await pool.end();
};
