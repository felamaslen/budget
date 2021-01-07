import Knex from 'knex';

import logger from '~api/modules/logger';
import { generateUserPin } from '~api/test-utils/generate-user-pin';

export async function seed(db: Knex): Promise<void> {
  const { pinRaw, pinHash } = await generateUserPin();

  const [id] = await db('users')
    .insert({
      name: 'admin',
      pin_hash: pinHash,
    })
    .returning('uid');

  logger.info('Created admin user', { id, pin: pinRaw });
}
