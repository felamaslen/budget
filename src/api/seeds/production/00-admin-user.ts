import Knex from 'knex';

import config from '~api/config';
import logger from '~api/modules/logger';
import { generateUserPin } from '~api/test-utils/generate-user-pin';

export async function seed(db: Knex): Promise<void> {
  logger.info('[seed] creating admin user');

  const trx = await db.transaction();

  await trx('users').where({ name: 'admin' }).del();

  const { pinRaw, pinHash } = await generateUserPin(config.user.defaultPin);

  const [id] = await trx('users')
    .insert({
      name: 'admin',
      pin_hash: pinHash,
    })
    .returning('uid');

  await trx.commit();

  logger.info('[seed] created admin user', { id, pin: pinRaw });
}
