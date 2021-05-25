import { sql } from 'slonik';

import config from '~api/config';
import { getPool, withSlonik } from '~api/modules/db';
import logger from '~api/modules/logger';
import { generateUserPin } from '~api/test-utils/generate-user-pin';

export const seed = withSlonik(async (db) => {
  logger.info('[seed] creating admin user');

  await db.query(sql`DELETE FROM users WHERE name = ${'admin'}`);

  const { pinRaw, pinHash } = await generateUserPin(config.user.defaultPin);

  const {
    rows: [{ uid }],
  } = await db.query<{ uid: number }>(sql`
  INSERT INTO users (name, pin_hash)
  VALUES (${'admin'}, ${pinHash})
  RETURNING uid
  `);

  logger.info('[seed] created admin user', { id: uid, pin: pinRaw });
});

if (require.main === module) {
  seed()
    .then(() => {
      getPool().end();
    })
    .catch((err) => {
      logger.error('Caught fatal error: %s', err);
      process.exit(1);
    });
}
