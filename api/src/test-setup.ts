import db from './modules/db';

export default async (): Promise<void> => {
  await db.migrate.latest();
  await db.seed.run();
};
