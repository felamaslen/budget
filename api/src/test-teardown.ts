import db from './modules/db';

export default async (): Promise<void> => {
  await db.destroy();
};
