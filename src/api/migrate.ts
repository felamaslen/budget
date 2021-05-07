import path from 'path';
import { setupSlonikMigrator } from '@slonik/migrator';

import { getPool } from './modules/db';

export const slonik = getPool();

export const migrator = setupSlonikMigrator({
  migrationsPath: path.resolve(__dirname, '../../migrations'),
  slonik,
  mainModule: module,
  log: process.env.NODE_ENV === 'test' ? () => {} : console.log, // eslint-disable-line
});
